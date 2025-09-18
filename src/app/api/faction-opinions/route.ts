import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const personId = searchParams.get('personId')
    const factionId = searchParams.get('factionId')

    const opinions = await prisma.factionOpinion.findMany({
      where: {
        personId: personId || undefined,
        factionId: factionId || undefined
      },
      include: {
        faction: true,
        person: true
      },
      orderBy: [
        { updatedAt: 'desc' }
      ]
    })

    return NextResponse.json({ 
      ok: true, 
      data: opinions,
      error: null 
    })
  } catch (error: unknown) {
    console.error('Error fetching faction opinions:', error)
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.personId || !body.factionId || typeof body.score !== 'number') {
      return NextResponse.json(
        { 
          ok: false, 
          data: null, 
          error: 'personId, factionId, and score are required' 
        },
        { status: 400 }
      )
    }

    // Validate score range
    if (body.score < -100 || body.score > 100) {
      return NextResponse.json(
        { 
          ok: false, 
          data: null, 
          error: 'Score must be between -100 and 100' 
        },
        { status: 400 }
      )
    }

    // Check if person and faction exist
    const [person, faction] = await Promise.all([
      prisma.person.findUnique({ where: { id: body.personId } }),
      prisma.faction.findUnique({ where: { id: body.factionId } })
    ])

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

    const opinion = await prisma.factionOpinion.upsert({
      where: { 
        personId_factionId: { 
          personId: body.personId, 
          factionId: body.factionId 
        } 
      },
      update: { 
        score: body.score, 
        reason: body.reason || null 
      },
      create: { 
        personId: body.personId, 
        factionId: body.factionId, 
        score: body.score, 
        reason: body.reason || null 
      },
      include: {
        faction: true,
        person: true
      }
    })

    return NextResponse.json({ 
      ok: true, 
      data: opinion,
      error: null 
    })
  } catch (error: unknown) {
    console.error('Error upserting faction opinion:', error)
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
