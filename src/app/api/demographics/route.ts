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
    // Get comprehensive demographics data
    const people = await prisma.person.findMany({
      select: {
        id: true,
        species: true,
        age: true,
        name: true,
        occupation: true,
        livesAtId: true,
        worksAtId: true,
        memberships: {
          select: {
            id: true
          }
        }
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

    const locations = await prisma.location.count()

    // Calculate missing data
    const peopleWithoutHomes = people.filter(p => !p.livesAtId).length
    const peopleWithoutWork = people.filter(p => !p.worksAtId).length
    const peopleWithoutFaction = people.filter(p => p.memberships.length === 0).length

    // Species distribution with age data
    const speciesDistribution = people.reduce((acc, person) => {
      const species = person.species || 'Unknown'
      if (!acc[species]) {
        acc[species] = { count: 0, ages: [] }
      }
      acc[species].count++
      if (person.age) {
        acc[species].ages.push(person.age)
      }
      return acc
    }, {} as Record<string, { count: number; ages: number[] }>)

    const speciesData = Object.entries(speciesDistribution).map(([species, data]) => {
      const ages = data.ages.filter(age => age > 0)
      const averageAge = ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0
      const ageRange = ages.length > 0 ? { min: Math.min(...ages), max: Math.max(...ages) } : { min: 0, max: 100 }
      
      return {
        species,
        count: data.count,
        averageAge,
        ageRange
      }
    })

    // Occupation distribution
    const occupationDistribution = people.reduce((acc, person) => {
      const occupation = person.occupation || 'Unemployed'
      acc[occupation] = (acc[occupation] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const occupationData = Object.entries(occupationDistribution).map(([occupation, count]) => ({
      occupation,
      count
    })).sort((a, b) => b.count - a.count)

    // Age category distribution
    const ageCategories = {
      'Child (0-12)': 0,
      'Teen (13-17)': 0,
      'Young Adult (18-25)': 0,
      'Adult (26-50)': 0,
      'Middle-aged (51-65)': 0,
      'Elderly (65+)': 0,
      'Unknown': 0
    }

    people.forEach(person => {
      if (!person.age) {
        ageCategories['Unknown']++
      } else if (person.age <= 12) {
        ageCategories['Child (0-12)']++
      } else if (person.age <= 17) {
        ageCategories['Teen (13-17)']++
      } else if (person.age <= 25) {
        ageCategories['Young Adult (18-25)']++
      } else if (person.age <= 50) {
        ageCategories['Adult (26-50)']++
      } else if (person.age <= 65) {
        ageCategories['Middle-aged (51-65)']++
      } else {
        ageCategories['Elderly (65+)']++
      }
    })

    const ageCategoryData = Object.entries(ageCategories).map(([category, count]) => ({
      category,
      count
    }))

    // Create speciesDemographics structure for the charts component
    const speciesDemographics: Record<string, {
      total: number
      withAge: number
      ageCategories: Record<string, number>
      ageRange?: { min: number; max: number }
      averageAge?: number
    }> = {}

    // Initialize species demographics
    speciesData.forEach(species => {
      speciesDemographics[species.species.toLowerCase()] = {
        total: species.count,
        withAge: species.averageAge > 0 ? species.count : 0,
        ageCategories: {
          'Young Adult': 0,
          'Mature': 0,
          'Middle Aged': 0,
          'Old': 0,
          'Venerable': 0
        },
        ageRange: species.ageRange,
        averageAge: species.averageAge
      }
    })

    // Distribute people across age categories by species
    people.forEach(person => {
      if (person.age && person.species) {
        const speciesKey = person.species.toLowerCase()
        if (speciesDemographics[speciesKey]) {
          let ageCategory = 'Young Adult'
          if (person.age <= 25) ageCategory = 'Young Adult'
          else if (person.age <= 40) ageCategory = 'Mature'
          else if (person.age <= 55) ageCategory = 'Middle Aged'
          else if (person.age <= 70) ageCategory = 'Old'
          else ageCategory = 'Venerable'
          
          speciesDemographics[speciesKey].ageCategories[ageCategory]++
        }
      }
    })

    // Faction distribution with actual membership counts
    const factionDistribution = factions.map(faction => ({
      name: faction.name,
      count: faction.memberships.length,
      color: faction.color || '#6B7280'
    }))

    // Create factionDistribution structure for charts (species -> faction -> count)
    const factionDistributionForCharts: Record<string, Record<string, number>> = {}
    
    // Initialize all species with empty faction counts
    speciesData.forEach(species => {
      factionDistributionForCharts[species.species.toLowerCase()] = {}
      factions.forEach(faction => {
        factionDistributionForCharts[species.species.toLowerCase()][faction.name] = 0
      })
    })

    // Count species per faction by looking at memberships
    people.forEach(person => {
      if (person.species && person.memberships.length > 0) {
        const speciesKey = person.species.toLowerCase()
        person.memberships.forEach(membership => {
          // Find the faction name for this membership
          const faction = factions.find(f => f.id === membership.factionId)
          if (faction && factionDistributionForCharts[speciesKey]) {
            factionDistributionForCharts[speciesKey][faction.name]++
          }
        })
      }
    })

    const demographicsData = {
      summary: {
        totalPeople: people.length,
        totalFactions: factions.length,
        totalLocations: locations,
        totalMemberships: factions.reduce((sum, faction) => sum + faction.memberships.length, 0),
        peopleWithoutHomes: peopleWithoutHomes,
        peopleWithoutWork: peopleWithoutWork,
        peopleWithoutFaction: peopleWithoutFaction,
        totalSpecies: speciesData.length,
        speciesWithAgeData: speciesData.filter(s => s.averageAge > 0).length
      },
      distributions: {
        factions: factionDistribution.map(faction => ({
          factionId: '', // Simplified
          factionName: faction.name,
          color: faction.color,
          count: faction.count
        })),
        species: speciesData,
        occupations: occupationData
      },
      recentActivity: {
        people: [],
        factions: [],
        locations: []
      },
      // Enhanced species data for charts
      speciesDemographics,
      factionDistribution: factionDistributionForCharts,
      // Legacy fields for backward compatibility
      totalPopulation: people.length,
      speciesCount: speciesData.length,
      factionCount: factions.length,
      speciesDistribution: speciesData,
      ageCategoryChartData: ageCategoryData,
      factionDistributionLegacy: factionDistribution,
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
