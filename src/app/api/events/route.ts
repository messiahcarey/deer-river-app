import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        effects: true
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json(events)

  } catch (error) {
    console.error('❌ Failed to fetch events:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      eventType, 
      startDate, 
      endDate, 
      worldSeed 
    } = body

    if (!name || !eventType || !startDate) {
      return NextResponse.json(
        { error: 'name, eventType, and startDate are required' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        eventType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        worldSeed,
        isActive: true
      }
    })

    return NextResponse.json(event)

  } catch (error) {
    console.error('❌ Failed to create event:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
