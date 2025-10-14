import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const cohorts = await prisma.cohort.findMany({
      include: {
        people: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                species: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(cohorts)

  } catch (error) {
    console.error('❌ Failed to fetch cohorts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const cohort = await prisma.cohort.create({
      data: {
        name,
        description: description || null,
        color: color || null
      }
    })

    return NextResponse.json(cohort)

  } catch (error) {
    console.error('❌ Failed to create cohort:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
