import { PrismaClient } from '@prisma/client'
import locationsData from '../seed/locations.json'
import factionsData from '../seed/factions.json'
import peopleData from '../seed/people.json'
import opinionsData from '../seed/opinions.json'
import resourcesData from '../seed/resources.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting to seed the database...')

  // Clear existing data
  await prisma.eventLog.deleteMany()
  await prisma.townResourceLedger.deleteMany()
  await prisma.opinion.deleteMany()
  await prisma.person.deleteMany()
  await prisma.household.deleteMany()
  await prisma.alliance.deleteMany()
  await prisma.faction.deleteMany()
  await prisma.resourceCategory.deleteMany()
  await prisma.location.deleteMany()

  console.log('🗑️ Cleared existing data')

  // Seed locations
  console.log('📍 Seeding locations...')
  for (const location of locationsData) {
    await prisma.location.create({
      data: {
        id: location.id,
        name: location.name,
        kind: location.kind,
        parentId: location.parentId || null,
        x: location.x || null,
        y: location.y || null,
        address: location.address || null,
        notes: location.notes || null,
      },
    })
  }

  // Seed factions
  console.log('🏛️ Seeding factions...')
  for (const faction of factionsData) {
    await prisma.faction.create({
      data: {
        id: faction.id,
        name: faction.name,
        motto: faction.motto || null,
        description: faction.description || null,
        color: faction.color || null,
      },
    })
  }

  // Seed resource categories
  console.log('💰 Seeding resource categories...')
  for (const resource of resourcesData) {
    await prisma.resourceCategory.create({
      data: {
        id: resource.id,
        name: resource.name,
        unit: resource.unit,
        notes: resource.notes || null,
      },
    })
  }

  // Create households
  console.log('🏠 Creating households...')
  const households = [
    {
      id: 'household_rumham',
      name: 'Rumham Family',
      locationId: 'loc_rumham_house',
      notes: 'Home of Laro and Franklin Rumham'
    },
    {
      id: 'household_armorer',
      name: 'Armorer\'s Quarters',
      locationId: 'loc_armorer_shop',
      notes: 'Living quarters above the shop'
    },
    {
      id: 'household_temple',
      name: 'Temple Quarters',
      locationId: 'loc_temple',
      notes: 'Living quarters for temple staff'
    },
    {
      id: 'household_ironbeard',
      name: 'Ironbeard Family',
      locationId: 'loc_blacksmith',
      notes: 'Thorin Ironbeard\'s family home'
    },
    {
      id: 'household_greenfield',
      name: 'Greenfield Farmhouse',
      locationId: 'loc_farm_1',
      notes: 'Old Tom\'s farmhouse'
    },
    {
      id: 'household_goldleaf',
      name: 'Goldleaf Residence',
      locationId: 'loc_tavern',
      notes: 'Mira\'s quarters above the tavern'
    },
    {
      id: 'household_steel',
      name: 'Captain Steel\'s Room',
      locationId: 'loc_tavern',
      notes: 'Rented room at the tavern'
    }
  ]

  for (const household of households) {
    await prisma.household.create({
      data: household,
    })
  }

  // Seed people
  console.log('👥 Seeding people...')
  for (const person of peopleData) {
    await prisma.person.create({
      data: {
        id: person.id,
        name: person.name,
        species: person.species,
        age: person.age || null,
        occupation: person.occupation || null,
        factionId: person.factionId || null,
        householdId: person.householdId || null,
        livesAtId: person.livesAtId,
        worksAtId: person.worksAtId || null,
        tags: person.tags || '',
        notes: person.notes || null,
      },
    })
  }

  // Seed opinions
  console.log('💭 Seeding opinions...')
  for (const opinion of opinionsData) {
    await prisma.opinion.create({
      data: {
        fromPersonId: opinion.fromPersonId,
        toPersonId: opinion.toPersonId,
        score: opinion.score,
        reason: opinion.reason || null,
      },
    })
  }

  // Create some initial resource ledger entries
  console.log('📊 Creating initial resource ledger entries...')
  const initialResources = [
    {
      resourceCategoryId: 'resource_food',
      delta: 100,
      reason: 'Initial food stockpile',
      date: new Date(),
    },
    {
      resourceCategoryId: 'resource_timber',
      delta: 50,
      reason: 'Initial timber stockpile',
      date: new Date(),
    },
    {
      resourceCategoryId: 'resource_coin',
      delta: 1000,
      reason: 'Town treasury',
      date: new Date(),
    },
    {
      resourceCategoryId: 'resource_livestock',
      delta: 25,
      reason: 'Initial livestock',
      date: new Date(),
    },
    {
      resourceCategoryId: 'resource_metal',
      delta: 200,
      reason: 'Initial metal stockpile',
      date: new Date(),
    },
    {
      resourceCategoryId: 'resource_stone',
      delta: 30,
      reason: 'Initial stone stockpile',
      date: new Date(),
    },
  ]

  for (const resource of initialResources) {
    await prisma.townResourceLedger.create({
      data: resource,
    })
  }

  // Create some initial events
  console.log('📝 Creating initial events...')
  const initialEvents = [
    {
      kind: 'town_meeting',
      entity: 'Person',
      entityId: 'person_laro_rumham',
      message: 'Laro Rumham called a town council meeting to discuss trade agreements',
    },
    {
      kind: 'trade',
      entity: 'Person',
      entityId: 'person_franklin_rumham',
      message: 'Franklin Rumham completed a major trade deal with neighboring towns',
    },
    {
      kind: 'crafting',
      entity: 'Person',
      entityId: 'person_armorer',
      message: 'The Armorer completed a masterwork sword for a visiting noble',
    },
    {
      kind: 'harvest',
      entity: 'Person',
      entityId: 'person_farmer',
      message: 'Old Tom Greenfield reported a successful harvest season',
    },
  ]

  for (const event of initialEvents) {
    await prisma.eventLog.create({
      data: event,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
