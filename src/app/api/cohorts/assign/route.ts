import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cohortId, personId, notes } = body

    if (!cohortId || !personId) {
      return NextResponse.json(
        { error: 'cohortId and personId are required' },
        { status: 400 }
      )
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.personCohort.findUnique({
      where: {
        personId_cohortId: {
          personId,
          cohortId
        }
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Person is already assigned to this cohort' },
        { status: 400 }
      )
    }

    const assignment = await prisma.personCohort.create({
      data: {
        personId,
        cohortId,
        notes: notes || null
      }
    })

    return NextResponse.json(assignment)

  } catch (error) {
    console.error('❌ Failed to assign person to cohort:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
