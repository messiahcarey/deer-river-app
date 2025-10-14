import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const policies = await prisma.seedingPolicy.findMany({
      include: {
        sourceCohort: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        targetCohort: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(policies)

  } catch (error) {
    console.error('❌ Failed to fetch seeding policies:', error)
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
      sourceCohortId,
      targetCohortId,
      domain,
      probability,
      involvementLevel,
      scoreMin,
      scoreMax,
      worldSeed
    } = body

    if (!name || !sourceCohortId || !targetCohortId || !domain) {
      return NextResponse.json(
        { error: 'name, sourceCohortId, targetCohortId, and domain are required' },
        { status: 400 }
      )
    }

    const policy = await prisma.seedingPolicy.create({
      data: {
        name,
        description: description || null,
        sourceCohortId,
        targetCohortId,
        domain,
        probability: probability || 0.5,
        involvementLevel: involvementLevel || 'FRIEND',
        scoreMin: scoreMin || 40,
        scoreMax: scoreMax || 80,
        worldSeed: worldSeed || null,
        isActive: true
      }
    })

    return NextResponse.json(policy)

  } catch (error) {
    console.error('❌ Failed to create seeding policy:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
