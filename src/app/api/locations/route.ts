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
        description: true,
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
    const { name, description, x, y } = body

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
        description: description || null,
        x: x ? parseFloat(x) : null,
        y: y ? parseFloat(y) : null
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

export async function PUT(request: Request) {
  try {
    console.log('Updating location...')

    const body = await request.json()
    const { id, name, description, x, y } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Location ID is required for update',
        timestamp: new Date().toISOString()
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

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
          'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    const prismaWithEnv = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })

    await prismaWithEnv.$connect()

    const location = await prismaWithEnv.location.update({
      where: { id },
      data: {
        name,
        description: description || null,
        x: x ? parseFloat(x) : null,
        y: y ? parseFloat(y) : null
      },
      include: {
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
    })

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      data: location,
      message: 'Location updated successfully',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Failed to update location:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('Deleting location...')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Location ID is required for deletion',
        timestamp: new Date().toISOString()
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

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
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    const prismaWithEnv = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })

    await prismaWithEnv.$connect()

    // Check if location has residents or workers
    const location = await prismaWithEnv.location.findUnique({
      where: { id },
      include: {
        residents: true,
        workers: true
      }
    })

    if (!location) {
      return NextResponse.json({
        success: false,
        error: 'Location not found',
        timestamp: new Date().toISOString()
      }, {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    if (location.residents.length > 0 || location.workers.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete location with residents or workers. Please reassign them first.',
        timestamp: new Date().toISOString()
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    await prismaWithEnv.location.delete({
      where: { id }
    })

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Failed to delete location:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
