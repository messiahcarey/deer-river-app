// Event creation API endpoint for creating events and triggering score recalculation
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ScoringService } from '@/lib/scoring/scoring-service'

export async function POST(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim()
  if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    return NextResponse.json({ 
      success: false, 
      error: 'Database connection not configured' 
    }, { status: 500 })
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  })

  try {
    const body = await request.json()
    const { 
      name, 
      category, 
      startsAt, 
      endsAt, 
      impact, 
      notes,
      triggerRecalculation = true 
    } = body

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and category are required' 
      }, { status: 400 })
    }

    // Validate impact structure if provided
    if (impact && typeof impact !== 'object') {
      return NextResponse.json({ 
        success: false, 
        error: 'Impact must be an object' 
      }, { status: 400 })
    }

    // Create the event
    const event = await prisma.eventV3.create({
      data: {
        name,
        category,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        impact: impact || {},
        notes
      }
    })

    // Trigger score recalculation if requested
    let recalculationResult = null
    if (triggerRecalculation) {
      try {
        const scoringService = new ScoringService(prisma)
        
        // Get all people to recalculate scores for
        const people = await prisma.person.findMany({
          select: { id: true }
        })

        console.log(`Starting score recalculation for ${people.length} people after event: ${event.name}`)
        
        // Recalculate scores for all people (this could be made async in production)
        for (const person of people) {
          try {
            await scoringService.recalculateAllScoresForPerson(person.id)
          } catch (error) {
            console.error(`Failed to recalculate scores for person ${person.id}:`, error)
            // Continue with other people even if one fails
          }
        }

        recalculationResult = {
          success: true,
          peopleProcessed: people.length,
          message: `Recalculated scores for ${people.length} people`
        }

      } catch (error) {
        console.error('Score recalculation failed:', error)
        recalculationResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error during recalculation'
        }
      }
    }

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      data: {
        event,
        recalculation: recalculationResult
      }
    })

  } catch (error) {
    console.error('Event creation API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create event' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim()
  if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    return NextResponse.json({ 
      success: false, 
      error: 'Database connection not configured' 
    }, { status: 500 })
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  })

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}
    if (category) {
      where.category = category
    }

    // Get events with pagination
    const events = await prisma.eventV3.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const totalCount = await prisma.eventV3.count({ where })

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      data: {
        events,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    })

  } catch (error) {
    console.error('Events list API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch events' 
    }, { status: 500 })
  }
}
