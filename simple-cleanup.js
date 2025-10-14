import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function simpleCleanup() {
  console.log('🧹 Simple cleanup of test data...\n')

  try {
    // Delete test cohorts (this will cascade to related records)
    const deletedCohorts = await prisma.cohort.deleteMany({
      where: { name: 'TEST_COHORT' }
    })
    console.log(`✅ Deleted ${deletedCohorts.count} test cohorts`)

    // Delete test events
    const deletedEvents = await prisma.event.deleteMany({
      where: { name: 'Test Event' }
    })
    console.log(`✅ Deleted ${deletedEvents.count} test events`)

    // Delete test policies
    const deletedPolicies = await prisma.seedingPolicy.deleteMany({
      where: { name: 'Test Policy' }
    })
    console.log(`✅ Deleted ${deletedPolicies.count} test policies`)

    console.log('\n🎉 Cleanup completed!')

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

simpleCleanup()
