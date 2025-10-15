// Score recomputation API endpoint for async score recalculation
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
      personId, 
      targetId, 
      window = '90d',
      force = false 
    } = body

    const scoringService = new ScoringService(prisma)

    if (personId && targetId) {
      // Recalculate loyalty score for specific person-target pair
      const loyaltyScore = await scoringService.loyalty.calculateLoyalty(personId, targetId, window)
      await scoringService.loyalty.saveLoyaltyScore(loyaltyScore)

      await prisma.$disconnect()

      return NextResponse.json({
        success: true,
        data: {
          type: 'loyalty',
          personId,
          targetId,
          score: loyaltyScore.score,
          breakdown: loyaltyScore.breakdown,
          window: loyaltyScore.window
        }
      })

    } else if (personId) {
      // Recalculate all scores for a specific person
      const result = await scoringService.recalculateAllScoresForPerson(personId)

      await prisma.$disconnect()

      return NextResponse.json({
        success: true,
        data: {
          type: 'person_all',
          personId,
          involvement: result.involvement,
          loyalties: result.loyalties
        }
      })

    } else {
      // Recalculate all scores for all people (use with caution)
      if (!force) {
        return NextResponse.json({ 
          success: false, 
          error: 'Bulk recalculation requires force=true parameter' 
        }, { status: 400 })
      }

      // Get all people
      const people = await prisma.person.findMany({
        select: { id: true, name: true }
      })

      const results = []
      let successCount = 0
      let errorCount = 0

      console.log(`Starting bulk score recalculation for ${people.length} people`)

      for (const person of people) {
        try {
          const result = await scoringService.recalculateAllScoresForPerson(person.id)
          results.push({
            personId: person.id,
            personName: person.name,
            success: true,
            involvement: result.involvement.score,
            loyaltyCount: result.loyalties.length
          })
          successCount++
        } catch (error) {
          console.error(`Failed to recalculate scores for person ${person.id}:`, error)
          results.push({
            personId: person.id,
            personName: person.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          errorCount++
        }
      }

      await prisma.$disconnect()

      return NextResponse.json({
        success: true,
        data: {
          type: 'bulk_all',
          totalPeople: people.length,
          successCount,
          errorCount,
          results: results.slice(0, 100) // Limit results to first 100 for response size
        }
      })
    }

  } catch (error) {
    console.error('Score recomputation API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to recompute scores' 
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
    const personId = searchParams.get('personId')
    const targetId = searchParams.get('targetId')
    const type = searchParams.get('type') || 'all' // 'involvement', 'loyalty', 'all'

    if (personId) {
      // Get scores for a specific person
      const where: any = { personId }
      if (targetId) {
        where.targetId = targetId
      }

      const involvementScores = type === 'all' || type === 'involvement' 
        ? await prisma.involvementScore.findMany({ where: { personId } })
        : []

      const loyaltyScores = type === 'all' || type === 'loyalty'
        ? await prisma.loyaltyScore.findMany({ where })
        : []

      await prisma.$disconnect()

      return NextResponse.json({
        success: true,
        data: {
          personId,
          involvement: involvementScores,
          loyalty: loyaltyScores
        }
      })

    } else {
      // Get summary statistics
      const involvementCount = await prisma.involvementScore.count()
      const loyaltyCount = await prisma.loyaltyScore.count()
      const personCount = await prisma.person.count()

      // Get recent score updates
      const recentInvolvement = await prisma.involvementScore.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          person: {
            select: { id: true, name: true }
          }
        }
      })

      const recentLoyalty = await prisma.loyaltyScore.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          person: {
            select: { id: true, name: true }
          }
        }
      })

      await prisma.$disconnect()

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalInvolvementScores: involvementCount,
            totalLoyaltyScores: loyaltyCount,
            totalPeople: personCount,
            coveragePercentage: personCount > 0 ? Math.round((involvementCount / personCount) * 100) : 0
          },
          recent: {
            involvement: recentInvolvement,
            loyalty: recentLoyalty
          }
        }
      })
    }

  } catch (error) {
    console.error('Scores query API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to query scores' 
    }, { status: 500 })
  }
}
