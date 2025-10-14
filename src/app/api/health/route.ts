import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL?.trim()
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
      error: null as string | null
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!dbUrl,
      databaseType: dbUrl?.startsWith('postgresql://') ? 'postgresql' : 'unknown'
    }
  }

  if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    health.database.error = 'Database connection not configured'
    return NextResponse.json(health, { status: 200 })
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  })

  try {
    await prisma.$connect()
    await prisma.person.count()
    health.database.connected = true
    await prisma.$disconnect()
  } catch (error) {
    health.database.error = error instanceof Error ? error.message : 'Unknown database error'
    await prisma.$disconnect()
  }

  return NextResponse.json(health)
}
