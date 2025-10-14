import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...\n')

  try {
    // Delete in reverse order to respect foreign key constraints
    await prisma.personRelationAudit.deleteMany({
      where: { changedBy: 'test-script' }
    })
    console.log('✅ Deleted test audit logs')

    await prisma.eventEffect.deleteMany({
      where: { event: { name: 'Test Event' } }
    })
    console.log('✅ Deleted test event effects')

    await prisma.event.deleteMany({
      where: { name: 'Test Event' }
    })
    console.log('✅ Deleted test events')

    await prisma.personRelation.deleteMany({
      where: { sourceRef: { test: true } }
    })
    console.log('✅ Deleted test person relations')

    await prisma.seedingPolicy.deleteMany({
      where: { name: 'Test Policy' }
    })
    console.log('✅ Deleted test seeding policies')

    await prisma.personCohort.deleteMany({
      where: { notes: 'Test relationship' }
    })
    console.log('✅ Deleted test person-cohort relationships')

    await prisma.cohort.deleteMany({
      where: { name: 'TEST_COHORT' }
    })
    console.log('✅ Deleted test cohorts')

    console.log('\n🎉 Test data cleanup completed!')

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupTestData()
