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
        color: true
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

    // Simple faction distribution
    const factionDistribution = factions.map(faction => ({
      name: faction.name,
      count: 0, // Simplified - no memberships relation
      color: faction.color || '#6B7280'
    }))

    const demographicsData = {
      totalPopulation: people.length,
      speciesCount: speciesData.length,
      factionCount: factions.length,
      speciesDistribution: speciesData,
      ageCategoryChartData: [], // Simplified
      factionDistribution,
      speciesFactionData: [], // Simplified
      demographics: {} // Simplified
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
