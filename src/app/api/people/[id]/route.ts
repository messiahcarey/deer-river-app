import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
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
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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

    // Handle faction memberships if factionIds is provided
    if (body.factionIds && Array.isArray(body.factionIds)) {
      // First, remove all existing memberships for this person
      await prismaWithEnv.personFactionMembership.deleteMany({
        where: { personId: id }
      })

      // Then create new memberships for each selected faction
      for (let i = 0; i < body.factionIds.length; i++) {
        const factionId = body.factionIds[i]
        await prismaWithEnv.personFactionMembership.create({
          data: {
            personId: id,
            factionId: factionId,
            role: 'member',
            isPrimary: i === 0, // First faction is primary
            alignment: 75,
            openness: 60,
            notes: 'Updated via PersonEditModal'
          }
        })
      }
    } else if (body.factionIds === null || body.factionIds === undefined || (Array.isArray(body.factionIds) && body.factionIds.length === 0)) {
      // Remove all memberships if no factions selected
      await prismaWithEnv.personFactionMembership.deleteMany({
        where: { personId: id }
      })
    }

    const person = await prismaWithEnv.person.update({
      where: { id },
      data: {
        name: body.name,
        species: body.species,
        age: body.age ? parseInt(body.age) : null,
        occupation: body.occupation,
        notes: body.notes,
        tags: body.tags,
        livesAtId: body.livesAtId,
        worksAtId: body.worksAtId,
        householdId: body.householdId
      },
      include: {
        livesAt: {
          select: {
            id: true,
            name: true,
            x: true,
            y: true
          }
        },
        worksAt: {
          select: {
            id: true,
            name: true,
            x: true,
            y: true
          }
        },
        household: true
      }
    })

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      data: person,
      message: 'Person updated successfully',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Failed to update person:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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

    // First, delete all related records (memberships, etc.)
    await prismaWithEnv.personFactionMembership.deleteMany({
      where: { personId: id }
    })

    // Then delete the person
    await prismaWithEnv.person.delete({
      where: { id }
    })

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'Person deleted successfully',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Failed to delete person:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
