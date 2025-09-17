import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Logger } from '@/lib/logger'
import { monitoring } from '@/lib/monitoring-lite'

export async function GET() {
  const startTime = Date.now()
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      memory: 'unknown',
      disk: 'unknown'
    },
    metrics: {
      responseTime: 0,
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version
    }
  }

  try {
    Logger.info('Health check started')

    // Test database connection
    const dbUrl = process.env.DATABASE_URL?.trim()
    if (dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'))) {
      const prisma = new PrismaClient({
        datasources: { db: { url: dbUrl } }
      })
      
      try {
        await prisma.$connect()
        await prisma.$queryRaw`SELECT 1`
        health.checks.database = 'connected'
        await prisma.$disconnect()
      } catch (dbError) {
        health.checks.database = 'error'
        health.status = 'unhealthy'
        Logger.error('Database health check failed', dbError)
      }
    } else {
      health.checks.database = 'no_connection_string'
      health.status = 'degraded'
    }

    // Memory check
    const memUsage = process.memoryUsage()
    const memUsageMB = memUsage.heapUsed / 1024 / 1024
    if (memUsageMB > 500) {
      health.checks.memory = 'warning'
      health.status = 'degraded'
    } else {
      health.checks.memory = 'ok'
    }

    health.metrics.responseTime = Date.now() - startTime

    // Add free monitoring data
    const systemMetrics = monitoring.getMetrics()
    health.metrics = {
      ...health.metrics,
      ...systemMetrics,
      responseTime: health.metrics.responseTime
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503

    Logger.apiResponse('GET', '/api/health', statusCode, { 
      status: health.status,
      responseTime: health.metrics.responseTime 
    })

    return NextResponse.json(health, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    Logger.error('Health check failed', error)
    health.status = 'unhealthy'
    health.checks.database = 'error'
    
    return NextResponse.json(health, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}
