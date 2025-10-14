import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cohortId, personId } = body

    if (!cohortId || !personId) {
      return NextResponse.json(
        { error: 'cohortId and personId are required' },
        { status: 400 }
      )
    }

    const assignment = await prisma.personCohort.findUnique({
      where: {
        personId_cohortId: {
          personId,
          cohortId
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    await prisma.personCohort.delete({
      where: {
        personId_cohortId: {
          personId,
          cohortId
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Failed to remove person from cohort:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
