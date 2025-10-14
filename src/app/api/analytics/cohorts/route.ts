import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const cohorts = await prisma.cohort.findMany({
      include: {
        people: true,
        _count: {
          select: {
            people: true
          }
        }
      }
    })

    const cohortStats = await Promise.all(
      cohorts.map(async (cohort) => {
        // Get relationships for this cohort
        const relationships = await prisma.personRelation.findMany({
          where: {
            OR: [
              { fromPerson: { cohorts: { some: { cohortId: cohort.id } } } },
              { toPerson: { cohorts: { some: { cohortId: cohort.id } } } }
            ]
          }
        })

        const avgScore = relationships.length > 0
          ? relationships.reduce((sum, rel) => sum + rel.score, 0) / relationships.length
          : 0

        return {
          id: cohort.id,
          name: cohort.name,
          color: cohort.color,
          memberCount: cohort._count.people,
          relationshipCount: relationships.length,
          avgScore: avgScore
        }
      })
    )

    return NextResponse.json(cohortStats)

  } catch (error) {
    console.error('❌ Failed to fetch cohort analytics:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
