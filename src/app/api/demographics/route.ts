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
    // Get basic demographics data
    const people = await prisma.person.findMany({
      select: {
        id: true,
        species: true,
        age: true,
        name: true
      }
    })

    const factions = await prisma.faction.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        memberships: {
          select: {
            id: true
          }
        }
      }
    })

    // Simple species distribution
    const speciesDistribution = people.reduce((acc, person) => {
      const species = person.species || 'Unknown'
      if (!acc[species]) {
        acc[species] = 0
      }
      acc[species]++
      return acc
    }, {} as Record<string, number>)

    const speciesData = Object.entries(speciesDistribution).map(([species, count]) => ({
      species,
      count,
      averageAge: 0, // Simplified
      ageRange: { min: 0, max: 100 } // Simplified
    }))

    // Faction distribution with actual membership counts
    const factionDistribution = factions.map(faction => ({
      name: faction.name,
      count: faction.memberships.length,
      color: faction.color || '#6B7280'
    }))

    const demographicsData = {
      summary: {
        totalPeople: people.length,
        totalFactions: factions.length,
        totalLocations: 0, // Will be calculated separately if needed
        totalMemberships: factions.reduce((sum, faction) => sum + faction.memberships.length, 0),
        peopleWithoutHomes: 0, // Simplified
        peopleWithoutWork: 0, // Simplified
        peopleWithoutFaction: 0, // Simplified
        totalSpecies: speciesData.length,
        speciesWithAgeData: 0 // Simplified
      },
      distributions: {
        factions: factionDistribution.map(faction => ({
          factionId: '', // Simplified
          factionName: faction.name,
          color: faction.color,
          count: faction.count
        })),
        species: speciesData,
        occupations: [] // Simplified
      },
      recentActivity: {
        people: [],
        factions: [],
        locations: []
      },
      // Legacy fields for backward compatibility
      totalPopulation: people.length,
      speciesCount: speciesData.length,
      factionCount: factions.length,
      speciesDistribution: speciesData,
      ageCategoryChartData: [],
      factionDistribution,
      speciesFactionData: [],
      demographics: {}
    }

    await prisma.$disconnect()
    return NextResponse.json(demographicsData)
  } catch (error) {
    console.error('Demographics API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch demographics data' 
    }, { status: 500 })
  }
}
