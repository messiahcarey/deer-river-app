import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL?.trim()
    if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
      return NextResponse.json({
        success: false,
        error: `Invalid DATABASE_URL format: ${dbUrl}`,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    const prismaWithEnv = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })

    await prismaWithEnv.$connect()

    // Get counts for all main tables
    const [peopleCount, factionsCount, locationsCount, membershipsCount, householdsCount] = await Promise.all([
      prismaWithEnv.person.count(),
      prismaWithEnv.faction.count(),
      prismaWithEnv.location.count(),
      prismaWithEnv.personFactionMembership.count(),
      prismaWithEnv.household.count()
    ])

    // Get sample data from each table
    const [people, factions, locations, memberships, households] = await Promise.all([
      prismaWithEnv.person.findMany({
        select: {
          id: true,
          name: true,
          species: true,
          tags: true,
          memberships: {
            where: { leftAt: null },
            select: {
              faction: {
                select: {
                  name: true,
                  color: true
                }
              },
              role: true,
              isPrimary: true
            }
          }
        },
        take: 5
      }),
      prismaWithEnv.faction.findMany({
        select: {
          id: true,
          name: true,
          color: true,
          motto: true,
          _count: {
            select: {
              memberships: {
                where: { leftAt: null }
              }
            }
          }
        }
      }),
      prismaWithEnv.location.findMany({
        select: {
          id: true,
          name: true,
          x: true,
          y: true,
          _count: {
            select: {
              residents: true,
              workers: true
            }
          }
        },
        take: 5
      }),
      prismaWithEnv.personFactionMembership.findMany({
        where: { leftAt: null },
        select: {
          id: true,
          role: true,
          isPrimary: true,
          person: {
            select: {
              name: true
            }
          },
          faction: {
            select: {
              name: true,
              color: true
            }
          }
        },
        take: 10
      }),
      prismaWithEnv.household.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              members: true
            }
          }
        },
        take: 5
      })
    ])

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          people: peopleCount,
          factions: factionsCount,
          locations: locationsCount,
          memberships: membershipsCount,
          households: householdsCount
        },
        sampleData: {
          people,
          factions,
          locations,
          memberships,
          households
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database query failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database query error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
