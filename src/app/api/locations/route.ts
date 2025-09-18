import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    console.log('Fetching locations...')

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

    // Fetch locations with their related data
    const locations = await prismaWithEnv.location.findMany({
      select: {
        id: true,
        name: true,
        kind: true,
        address: true,
        notes: true,
        x: true,
        y: true,
        residents: {
          select: {
            id: true,
            name: true,
            species: true,
            age: true,
            occupation: true,
          },
        },
        workers: {
          select: {
            id: true,
            name: true,
            species: true,
            age: true,
            occupation: true,
          },
        },
      },
      orderBy: {
        name: 'asc'
      }
    })

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      data: locations,
      count: locations.length,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Failed to fetch locations:', error)
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

export async function POST(request: Request) {
  try {
    console.log('Creating new location...')

    const body = await request.json()
    const { name, kind, address, x, y, notes } = body

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

    const location = await prismaWithEnv.location.create({
      data: {
        name,
        kind: kind || 'Unknown',
        address: address || null,
        x: x ? parseFloat(x) : null,
        y: y ? parseFloat(y) : null,
        notes: notes || null
      },
      include: {
        residents: true,
        workers: true
      }
    })

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      data: location,
      message: 'Location created successfully',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Failed to create location:', error)
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
