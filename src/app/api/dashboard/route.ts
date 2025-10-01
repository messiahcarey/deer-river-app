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

    // Get faction distribution - simplified approach
    const factionDistributionWithNames = await prisma.faction.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            memberships: true
          }
        }
      },
      orderBy: {
        memberships: {
          _count: 'desc'
        }
      }
    }).then(factions => 
      factions.map(faction => ({
        factionId: faction.id,
        factionName: faction.name,
        color: faction.color,
        count: faction._count.memberships
      }))
    )

    // Get species distribution - simplified approach
    const speciesDistribution = await prisma.person.findMany({
      select: {
        species: true
      }
    }).then(people => {
      const counts = people.reduce((acc, person) => {
        const species = person.species || 'Unknown'
        acc[species] = (acc[species] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      return Object.entries(counts)
        .map(([species, count]) => ({ species, _count: { species: count } }))
        .sort((a, b) => b._count.species - a._count.species)
    })

    // Get occupation distribution - simplified approach
    const occupationDistribution = await prisma.person.findMany({
      select: {
        occupation: true
      }
    }).then(people => {
      const counts = people.reduce((acc, person) => {
        const occupation = person.occupation || 'Unknown'
        acc[occupation] = (acc[occupation] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      return Object.entries(counts)
        .map(([occupation, count]) => ({ occupation, _count: { occupation: count } }))
        .sort((a, b) => b._count.occupation - a._count.occupation)
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
