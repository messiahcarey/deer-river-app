import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
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
    const people = await prisma.person.findMany({
      select: {
        id: true,
        name: true,
        age: true,
        species: true,
        occupation: true,
        tags: true,
        livesAt: {
          select: {
            id: true,
            name: true,
            kind: true
          }
        },
        worksAt: {
          select: {
            id: true,
            name: true,
            kind: true
          }
        },
        memberships: {
          select: {
            id: true,
            faction: {
              select: {
                id: true,
                name: true,
                color: true
              }
            },
            role: true,
            isPrimary: true
          }
        },
        // Enhanced v3 relationships
        household: {
          select: {
            id: true,
            name: true,
            locationId: true
          }
        },
        workplace: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true
          }
        },
        involvementScore: {
          select: {
            score: true,
            window: true,
            updatedAt: true
          }
        },
        loyaltyScores: {
          select: {
            targetId: true,
            score: true,
            window: true
          },
          take: 3,
          orderBy: { score: 'desc' }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    await prisma.$disconnect()
    return NextResponse.json({ success: true, data: people })
  } catch (error) {
    console.error('People API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch people' 
    }, { status: 500 })
  }
}
