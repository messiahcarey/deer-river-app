// Demographics data based on D&D age categories
// Excludes: gnomes, elf (Drow), dwarf (mountain)

export interface AgeCategory {
  name: string
  minAge: number
  maxAge: number
}

export interface SpeciesDemographics {
  species: string
  ageCategories: AgeCategory[]
  lifespan: {
    min: number
    max: number
  }
}

export const SPECIES_DEMOGRAPHICS: SpeciesDemographics[] = [
  {
    species: 'dwarf',
    lifespan: { min: 35, max: 450 },
    ageCategories: [
      { name: 'Young Adult', minAge: 35, maxAge: 50 },
      { name: 'Mature', minAge: 51, maxAge: 150 },
      { name: 'Middle Aged', minAge: 151, maxAge: 250 },
      { name: 'Old', minAge: 251, maxAge: 350 },
      { name: 'Venerable', minAge: 351, maxAge: 450 }
    ]
  },
  {
    species: 'elf, aquatic',
    lifespan: { min: 75, max: 1200 },
    ageCategories: [
      { name: 'Young Adult', minAge: 75, maxAge: 150 },
      { name: 'Mature', minAge: 151, maxAge: 450 },
      { name: 'Middle Aged', minAge: 451, maxAge: 700 },
      { name: 'Old', minAge: 701, maxAge: 1000 },
      { name: 'Venerable', minAge: 1001, maxAge: 1200 }
    ]
  },
  {
    species: 'elf, gray',
    lifespan: { min: 150, max: 2000 },
    ageCategories: [
      { name: 'Young Adult', minAge: 150, maxAge: 250 },
      { name: 'Mature', minAge: 251, maxAge: 650 },
      { name: 'Middle Aged', minAge: 651, maxAge: 1000 },
      { name: 'Old', minAge: 1001, maxAge: 1500 },
      { name: 'Venerable', minAge: 1501, maxAge: 2000 }
    ]
  },
  {
    species: 'elf, high',
    lifespan: { min: 100, max: 1600 },
    ageCategories: [
      { name: 'Young Adult', minAge: 100, maxAge: 175 },
      { name: 'Mature', minAge: 176, maxAge: 550 },
      { name: 'Middle Aged', minAge: 551, maxAge: 875 },
      { name: 'Old', minAge: 876, maxAge: 1200 },
      { name: 'Venerable', minAge: 1201, maxAge: 1600 }
    ]
  },
  {
    species: 'elf, wood',
    lifespan: { min: 75, max: 1350 },
    ageCategories: [
      { name: 'Young Adult', minAge: 75, maxAge: 150 },
      { name: 'Mature', minAge: 151, maxAge: 500 },
      { name: 'Middle Aged', minAge: 501, maxAge: 800 },
      { name: 'Old', minAge: 801, maxAge: 1100 },
      { name: 'Venerable', minAge: 1101, maxAge: 1350 }
    ]
  },
  {
    species: 'half-elf',
    lifespan: { min: 24, max: 325 },
    ageCategories: [
      { name: 'Young Adult', minAge: 24, maxAge: 40 },
      { name: 'Mature', minAge: 41, maxAge: 100 },
      { name: 'Middle Aged', minAge: 101, maxAge: 175 },
      { name: 'Old', minAge: 176, maxAge: 250 },
      { name: 'Venerable', minAge: 251, maxAge: 325 }
    ]
  },
  {
    species: 'halfling',
    lifespan: { min: 22, max: 199 },
    ageCategories: [
      { name: 'Young Adult', minAge: 22, maxAge: 33 },
      { name: 'Mature', minAge: 34, maxAge: 68 },
      { name: 'Middle Aged', minAge: 69, maxAge: 101 },
      { name: 'Old', minAge: 102, maxAge: 144 },
      { name: 'Venerable', minAge: 145, maxAge: 199 }
    ]
  },
  {
    species: 'half-orc',
    lifespan: { min: 12, max: 80 },
    ageCategories: [
      { name: 'Young Adult', minAge: 12, maxAge: 15 },
      { name: 'Mature', minAge: 16, maxAge: 30 },
      { name: 'Middle Aged', minAge: 31, maxAge: 45 },
      { name: 'Old', minAge: 46, maxAge: 60 },
      { name: 'Venerable', minAge: 61, maxAge: 80 }
    ]
  },
  {
    species: 'human',
    lifespan: { min: 14, max: 120 },
    ageCategories: [
      { name: 'Young Adult', minAge: 14, maxAge: 20 },
      { name: 'Mature', minAge: 21, maxAge: 40 },
      { name: 'Middle Aged', minAge: 41, maxAge: 60 },
      { name: 'Old', minAge: 61, maxAge: 90 },
      { name: 'Venerable', minAge: 91, maxAge: 120 }
    ]
  }
]

export function getAgeCategory(species: string, age: number): string {
  const speciesData = SPECIES_DEMOGRAPHICS.find(s => s.species === species)
  if (!speciesData) {
    return 'Unknown'
  }

  const category = speciesData.ageCategories.find(
    cat => age >= cat.minAge && age <= cat.maxAge
  )
  
  return category ? category.name : 'Unknown'
}

export function getSpeciesLifespan(species: string): { min: number; max: number } | null {
  const speciesData = SPECIES_DEMOGRAPHICS.find(s => s.species === species)
  return speciesData ? speciesData.lifespan : null
}

export function getAgeCategoriesForSpecies(species: string): AgeCategory[] {
  const speciesData = SPECIES_DEMOGRAPHICS.find(s => s.species === species)
  return speciesData ? speciesData.ageCategories : []
}

export function getAllSpecies(): string[] {
  return SPECIES_DEMOGRAPHICS.map(s => s.species)
}

export function getDemographicsBySpecies(people: Array<{ species: string; age?: number }>) {
  const speciesStats: Record<string, {
    total: number
    ageCategories: Record<string, number>
    averageAge?: number
    ageRange?: { min: number; max: number }
  }> = {}

  // Initialize species stats
  SPECIES_DEMOGRAPHICS.forEach(species => {
    speciesStats[species.species] = {
      total: 0,
      ageCategories: {},
      ageRange: { min: Infinity, max: -Infinity }
    }
    
    // Initialize age categories
    species.ageCategories.forEach(cat => {
      speciesStats[species.species].ageCategories[cat.name] = 0
    })
  })

  // Process people data
  people.forEach(person => {
    const species = person.species || 'Unknown'
    if (speciesStats[species]) {
      speciesStats[species].total++
      
      if (person.age !== undefined) {
        const age = person.age
        const category = getAgeCategory(species, age)
        
        if (speciesStats[species].ageCategories[category] !== undefined) {
          speciesStats[species].ageCategories[category]++
        }
        
        // Update age range
        if (speciesStats[species].ageRange) {
          speciesStats[species].ageRange.min = Math.min(speciesStats[species].ageRange.min, age)
          speciesStats[species].ageRange.max = Math.max(speciesStats[species].ageRange.max, age)
        }
      }
    }
  })

  // Calculate average ages
  Object.keys(speciesStats).forEach(species => {
    const peopleOfSpecies = people.filter(p => p.species === species && p.age !== undefined)
    if (peopleOfSpecies.length > 0) {
      const totalAge = peopleOfSpecies.reduce((sum, p) => sum + (p.age || 0), 0)
      speciesStats[species].averageAge = Math.round(totalAge / peopleOfSpecies.length)
    }
  })

  return speciesStats
}
