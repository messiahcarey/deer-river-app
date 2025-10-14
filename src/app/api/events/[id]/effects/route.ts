import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const body = await request.json()
    const {
      effectType,
      value,
      scope,
      domain,
      sourceCohortId,
      targetCohortId,
      fromPersonId,
      toPersonId,
      decayPerDay
    } = body

    if (!effectType || !value || !scope) {
      return NextResponse.json(
        { error: 'effectType, value, and scope are required' },
        { status: 400 }
      )
    }

    // Verify the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const effect = await prisma.eventEffect.create({
      data: {
        eventId,
        domain: domain || null,
        effectType,
        value,
        scope,
        sourceCohortId: sourceCohortId || null,
        targetCohortId: targetCohortId || null,
        fromPersonId: fromPersonId || null,
        toPersonId: toPersonId || null,
        decayPerDay: decayPerDay || null,
        isActive: true
      }
    })

    return NextResponse.json(effect)

  } catch (error) {
    console.error('❌ Failed to create event effect:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    const effects = await prisma.eventEffect.findMany({
      where: { eventId },
      include: {
        sourceCohort: true,
        targetCohort: true,
        fromPerson: true,
        toPerson: true
      }
    })

    return NextResponse.json(effects)

  } catch (error) {
    console.error('❌ Failed to fetch event effects:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
