import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Fetching dashboard data...')

    // Get all the data we need for the dashboard
    const [
      people,
      factions,
      locations,
      memberships
    ] = await Promise.all([
      // Basic counts
      prisma.person.count(),
      prisma.faction.count(),
      prisma.location.count(),
      prisma.personFactionMembership.count()
    ])

    // Get faction distribution
    const factionDistribution = await prisma.personFactionMembership.groupBy({
      by: ['factionId'],
      _count: {
        factionId: true
      },
      orderBy: {
        _count: {
          factionId: 'desc'
        }
      }
    })

    // Get faction names for the distribution
    const factionNames = await prisma.faction.findMany({
      select: {
        id: true,
        name: true,
        color: true
      }
    })

    const factionDistributionWithNames = factionDistribution.map(item => {
      const faction = factionNames.find(f => f.id === item.factionId)
      return {
        factionId: item.factionId,
        factionName: faction?.name || 'Unknown',
        color: faction?.color || '#6B7280',
        count: item._count.factionId
      }
    })

    // Get species distribution
    const speciesDistribution = await prisma.person.groupBy({
      by: ['species'],
      _count: {
        species: true
      },
      orderBy: {
        _count: {
          species: 'desc'
        }
      }
    })

    // Get occupation distribution
    const occupationDistribution = await prisma.person.groupBy({
      by: ['occupation'],
      _count: {
        occupation: true
      },
      where: {
        occupation: {
          not: null
        }
      },
      orderBy: {
        _count: {
          occupation: 'desc'
        }
      }
    })

    // Get people without homes (this will always be 0 since livesAtId is required)
    const peopleWithoutHomes = 0

    // Get people without work
    const peopleWithoutWork = await prisma.person.count({
      where: {
        worksAtId: null
      }
    })

    // Get people without faction
    const peopleWithoutFaction = await prisma.person.count({
      where: {
        memberships: {
          none: {}
        }
      }
    })

    const dashboardData = {
      summary: {
        totalPeople: people,
        totalFactions: factions,
        totalLocations: locations,
        totalMemberships: memberships,
        peopleWithoutHomes,
        peopleWithoutWork,
        peopleWithoutFaction
      },
      distributions: {
        factions: factionDistributionWithNames,
        species: speciesDistribution.map(item => ({
          species: item.species || 'Unknown',
          count: item._count.species
        })),
        occupations: occupationDistribution.map(item => ({
          occupation: item.occupation || 'Unknown',
          count: item._count.occupation
        }))
      },
      recentActivity: {
        people: [],
        factions: [],
        locations: []
      }
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
