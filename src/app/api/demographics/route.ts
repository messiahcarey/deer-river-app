import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getDemographicsBySpecies, SPECIES_DEMOGRAPHICS } from '@/lib/demographics'

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
    await prisma.$connect()
    console.log('Fetching demographics data...')

    // Get all people with their species and age
    const people = await prisma.person.findMany({
      select: {
        id: true,
        species: true,
        age: true,
        name: true,
        occupation: true
      }
    })

    // Get faction memberships for each person
    const memberships = await prisma.personFactionMembership.findMany({
      include: {
        faction: true,
        person: {
          select: {
            id: true,
            species: true,
            age: true
          }
        }
      }
    })

    // Get locations for each person
    const locations = await prisma.location.findMany({
      include: {
        residents: {
          select: {
            id: true,
            species: true,
            age: true
          }
        }
      }
    })

    // Calculate species-based demographics
    const peopleForDemographics = people.map(p => ({
      species: p.species || 'Unknown',
      age: p.age || undefined
    }))
    const speciesDemographics = getDemographicsBySpecies(peopleForDemographics)

    // Calculate faction distribution by species
    const factionBySpecies: Record<string, Record<string, number>> = {}
    memberships.forEach(membership => {
      const species = membership.person.species || 'Unknown'
      const factionName = membership.faction.name
      
      if (!factionBySpecies[species]) {
        factionBySpecies[species] = {}
      }
      if (!factionBySpecies[species][factionName]) {
        factionBySpecies[species][factionName] = 0
      }
      factionBySpecies[species][factionName]++
    })

    // Calculate location distribution by species
    const locationBySpecies: Record<string, Record<string, number>> = {}
    locations.forEach(location => {
      location.residents.forEach(resident => {
        const species = resident.species || 'Unknown'
        const locationName = location.name
        
        if (!locationBySpecies[species]) {
          locationBySpecies[species] = {}
        }
        if (!locationBySpecies[species][locationName]) {
          locationBySpecies[species][locationName] = 0
        }
        locationBySpecies[species][locationName]++
      })
    })

    // Calculate occupation distribution by species
    const occupationBySpecies: Record<string, Record<string, number>> = {}
    people.forEach(person => {
      const species = person.species || 'Unknown'
      const occupation = person.occupation || 'Unknown'
      
      if (!occupationBySpecies[species]) {
        occupationBySpecies[species] = {}
      }
      if (!occupationBySpecies[species][occupation]) {
        occupationBySpecies[species][occupation] = 0
      }
      occupationBySpecies[species][occupation]++
    })

    // Calculate age distribution by species
    const ageDistributionBySpecies: Record<string, {
      total: number
      withAge: number
      ageCategories: Record<string, number>
      ageRange?: { min: number; max: number }
      averageAge?: number
    }> = {}

    Object.keys(speciesDemographics).forEach(species => {
      const stats = speciesDemographics[species]
      ageDistributionBySpecies[species] = {
        total: stats.total,
        withAge: people.filter(p => p.species === species && p.age !== undefined).length,
        ageCategories: stats.ageCategories,
        ageRange: stats.ageRange?.min !== Infinity ? stats.ageRange : undefined,
        averageAge: stats.averageAge
      }
    })

    const demographicsData = {
      summary: {
        totalPeople: people.length,
        totalSpecies: Object.keys(speciesDemographics).length,
        speciesWithAgeData: Object.values(ageDistributionBySpecies).filter(s => s.withAge > 0).length
      },
      speciesDemographics: ageDistributionBySpecies,
      factionDistribution: factionBySpecies,
      locationDistribution: locationBySpecies,
      occupationDistribution: occupationBySpecies,
      speciesDefinitions: SPECIES_DEMOGRAPHICS,
      rawData: {
        people: people.map(p => ({
          id: p.id,
          name: p.name,
          species: p.species,
          age: p.age,
          occupation: p.occupation
        }))
      }
    }

    return NextResponse.json({
      success: true,
      data: demographicsData
    })

  } catch (error) {
    console.error('Demographics API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch demographics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
