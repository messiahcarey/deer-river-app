import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: {
            effects: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    const eventStats = events.map(event => ({
      id: event.id,
      name: event.name,
      eventType: event.eventType,
      isActive: event.isActive,
      effectCount: event._count.effects,
      startDate: event.startDate,
      endDate: event.endDate
    }))

    return NextResponse.json(eventStats)

  } catch (error) {
    console.error('❌ Failed to fetch event analytics:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
