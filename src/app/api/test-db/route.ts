import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    console.log('Testing database connection...')

    // Ensure the URL starts with the correct protocol
    const dbUrl = process.env.DATABASE_URL?.trim()
    if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
      return NextResponse.json({
        success: false,
        error: `Invalid DATABASE_URL format: ${dbUrl}`,
        timestamp: new Date().toISOString()
      }, {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    // Create Prisma client with explicit environment variable
    const prismaWithEnv = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })

    await prismaWithEnv.$connect()

    // Test basic queries
    const locationCount = await prismaWithEnv.location.count()
    const personCount = await prismaWithEnv.person.count()
    const factionCount = await prismaWithEnv.faction.count()

    // Get a sample person with their location
    const samplePerson = await prismaWithEnv.person.findFirst({
      select: {
        id: true,
        name: true,
        livesAt: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      data: {
        locationCount,
        personCount,
        factionCount,
        samplePerson,
        databaseUrl: dbUrl.substring(0, 20) + '...' // Only show first 20 chars for security
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}