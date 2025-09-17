import { PrismaClient } from '@prisma/client'

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

  // Create a simple location
  const location = await prisma.location.create({
    data: {
      name: 'Deer River Town Center',
      kind: 'district',
      x: 0,
      y: 0,
      address: 'Main Square',
      notes: 'The heart of Deer River'
    }
  })

  console.log('📍 Created location:', location.name)

  // Create a simple faction
  const faction = await prisma.faction.create({
    data: {
      name: 'Town Council',
      motto: 'Order and Prosperity',
      description: 'The governing body of Deer River',
      color: '#1e40af'
    }
  })

  console.log('🏛️ Created faction:', faction.name)

  // Create a simple person
  const person = await prisma.person.create({
    data: {
      name: 'Laro Rumham',
      species: 'Human',
      age: 45,
      tags: 'diplomatic,wise,authoritative',
      notes: 'Senior member of the town council',
      livesAtId: location.id,
      factionId: faction.id
    }
  })

  console.log('👥 Created person:', person.name)

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
