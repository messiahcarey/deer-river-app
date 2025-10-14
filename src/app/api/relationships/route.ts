import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const relationships = await prisma.personRelation.findMany({
      include: {
        fromPerson: {
          select: {
            id: true,
            name: true,
            species: true
          }
        },
        toPerson: {
          select: {
            id: true,
            name: true,
            species: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      }
    })

    return NextResponse.json(relationships)

  } catch (error) {
    console.error('❌ Failed to fetch relationships:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
