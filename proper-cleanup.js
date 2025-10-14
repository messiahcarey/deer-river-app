import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function properCleanup() {
  console.log('🧹 Proper cleanup respecting foreign key constraints...\n')

  try {
    // 1. Delete audit logs first
    const deletedAudits = await prisma.personRelationAudit.deleteMany({
      where: { changedBy: 'test-script' }
    })
    console.log(`✅ Deleted ${deletedAudits.count} audit logs`)

    // 2. Delete event effects
    const deletedEffects = await prisma.eventEffect.deleteMany({
      where: { event: { name: 'Test Event' } }
    })
    console.log(`✅ Deleted ${deletedEffects.count} event effects`)

    // 3. Delete events
    const deletedEvents = await prisma.event.deleteMany({
      where: { name: 'Test Event' }
    })
    console.log(`✅ Deleted ${deletedEvents.count} events`)

    // 4. Delete person relations
    const deletedRelations = await prisma.personRelation.deleteMany({
      where: { 
        AND: [
          { fromPersonId: { not: undefined } },
          { toPersonId: { not: undefined } },
          { score: 75 }
        ]
      }
    })
    console.log(`✅ Deleted ${deletedRelations.count} person relations`)

    // 5. Delete seeding policies
    const deletedPolicies = await prisma.seedingPolicy.deleteMany({
      where: { name: 'Test Policy' }
    })
    console.log(`✅ Deleted ${deletedPolicies.count} seeding policies`)

    // 6. Delete person-cohort relationships
    const deletedPersonCohorts = await prisma.personCohort.deleteMany({
      where: { notes: 'Test relationship' }
    })
    console.log(`✅ Deleted ${deletedPersonCohorts.count} person-cohort relationships`)

    // 7. Finally delete cohorts
    const deletedCohorts = await prisma.cohort.deleteMany({
      where: { name: 'TEST_COHORT' }
    })
    console.log(`✅ Deleted ${deletedCohorts.count} cohorts`)

    console.log('\n🎉 Proper cleanup completed! All foreign key constraints respected.')

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

properCleanup()
