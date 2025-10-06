import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Check DATABASE_URL first
    const dbUrl = process.env.DATABASE_URL?.trim()
    if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
      return NextResponse.json({
        ok: false,
        data: null,
        error: `Invalid DATABASE_URL format: ${dbUrl}`,
        timestamp: new Date().toISOString()
      }, { status: 500 })
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

    const { searchParams } = new URL(request.url)
    const personId = searchParams.get('personId')
    const factionId = searchParams.get('factionId')
    const active = searchParams.get('active')

    const memberships = await prismaWithEnv.personFactionMembership.findMany({
      where: {
        personId: personId || undefined,
        factionId: factionId || undefined,
        ...(active === 'true' ? { leftAt: null } : {})
      },
      include: {
        faction: true,
        person: true
      },
      orderBy: [
        { isPrimary: 'desc' },
        { joinedAt: 'desc' }
      ]
    })

    await prismaWithEnv.$disconnect()

    return NextResponse.json({ 
      ok: true, 
      data: memberships,
      error: null 
    })
  } catch (error: unknown) {
    console.error('Error fetching memberships:', error)
    return NextResponse.json(
      { 
        ok: false, 
        data: null, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check DATABASE_URL first
    const dbUrl = process.env.DATABASE_URL?.trim()
    if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
      return NextResponse.json({
        ok: false,
        data: null,
        error: `Invalid DATABASE_URL format: ${dbUrl}`,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.personId || !body.factionId) {
      return NextResponse.json(
        { 
          ok: false, 
          data: null, 
          error: 'personId and factionId are required' 
        },
        { status: 400 }
      )
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

    // Check if person and faction exist
    const [person, faction] = await Promise.all([
      prismaWithEnv.person.findUnique({ where: { id: body.personId } }),
      prismaWithEnv.faction.findUnique({ where: { id: body.factionId } })
    ])

    // Check if membership already exists
    const existingMembership = await prismaWithEnv.personFactionMembership.findFirst({
      where: {
        personId: body.personId,
        factionId: body.factionId,
        leftAt: null // Only active memberships
      }
    })

    if (existingMembership) {
      return NextResponse.json(
        { 
          ok: false, 
          data: null, 
          error: 'Person is already a member of this faction' 
        },
        { status: 409 }
      )
    }

    if (!person) {
      return NextResponse.json(
        { 
          ok: false, 
          data: null, 
          error: 'Person not found' 
        },
        { status: 404 }
      )
    }

    if (!faction) {
      return NextResponse.json(
        { 
          ok: false, 
          data: null, 
          error: 'Faction not found' 
        },
        { status: 404 }
      )
    }

    // If this is set as primary, remove primary status from other memberships
    if (body.isPrimary) {
      await prismaWithEnv.personFactionMembership.updateMany({
        where: {
          personId: body.personId,
          isPrimary: true,
          leftAt: null
        },
        data: { isPrimary: false }
      })
    }

    const membership = await prismaWithEnv.personFactionMembership.create({
      data: {
        personId: body.personId,
        factionId: body.factionId,
        role: body.role || 'member',
        isPrimary: Boolean(body.isPrimary),
        alignment: typeof body.alignment === 'number' ? body.alignment : 0,
        openness: typeof body.openness === 'number' ? body.openness : 50,
        notes: body.notes || null
      },
      include: {
        faction: true,
        person: true
      }
    })

    await prismaWithEnv.$disconnect()

    return NextResponse.json({ 
      ok: true, 
      data: membership,
      error: null 
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating membership:', error)
    return NextResponse.json(
      { 
        ok: false, 
        data: null, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      },
      { status: 500 }
    )
  }
}
