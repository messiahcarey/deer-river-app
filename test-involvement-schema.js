import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testInvolvementSchema() {
  console.log('🧪 Testing Involvement & Loyalty v2 Schema...\n')

  try {
    // Test 1: Create a cohort
    console.log('1. Creating test cohort...')
    const cohort = await prisma.cohort.create({
      data: {
        name: 'TEST_COHORT',
        description: 'Test cohort for schema validation',
        color: '#FF5733'
      }
    })
    console.log('✅ Cohort created:', cohort.name)

    // Test 2: Get a person to test relationships
    console.log('\n2. Finding a test person...')
    const person = await prisma.person.findFirst()
    if (!person) {
      console.log('❌ No people found in database')
      return
    }
    console.log('✅ Found person:', person.name)

    // Test 3: Create person-cohort relationship
    console.log('\n3. Creating person-cohort relationship...')
    const personCohort = await prisma.personCohort.create({
      data: {
        personId: person.id,
        cohortId: cohort.id,
        notes: 'Test relationship'
      }
    })
    console.log('✅ Person-cohort relationship created')

    // Test 4: Create a seeding policy
    console.log('\n4. Creating seeding policy...')
    const policy = await prisma.seedingPolicy.create({
      data: {
        name: 'Test Policy',
        description: 'Test seeding policy',
        sourceCohortId: cohort.id,
        targetCohortId: cohort.id,
        domain: 'KINSHIP',
        probability: 0.5,
        involvementLevel: 'FRIEND',
        scoreMin: 40,
        scoreMax: 80,
        worldSeed: 'test-seed-123'
      }
    })
    console.log('✅ Seeding policy created:', policy.name)

    // Test 5: Create a person relation
    console.log('\n5. Creating person relation...')
    const relation = await prisma.personRelation.create({
      data: {
        fromPersonId: person.id,
        toPersonId: person.id, // Self-relation for testing
        domain: 'KINSHIP',
        involvement: 'FRIEND',
        score: 75,
        provenance: 'MANUAL',
        sourceRef: { test: true }
      }
    })
    console.log('✅ Person relation created with score:', relation.score)

    // Test 6: Create an event
    console.log('\n6. Creating test event...')
    const event = await prisma.event.create({
      data: {
        name: 'Test Event',
        description: 'Test event for schema validation',
        eventType: 'CELEBRATION',
        startDate: new Date(),
        worldSeed: 'event-seed-456'
      }
    })
    console.log('✅ Event created:', event.name)

    // Test 7: Create event effect
    console.log('\n7. Creating event effect...')
    const effect = await prisma.eventEffect.create({
      data: {
        eventId: event.id,
        domain: 'KINSHIP',
        effectType: 'ADD',
        value: 10,
        scope: 'GLOBAL',
        isActive: true
      }
    })
    console.log('✅ Event effect created:', effect.effectType)

    // Test 8: Create audit log
    console.log('\n8. Creating audit log...')
    const audit = await prisma.personRelationAudit.create({
      data: {
        relationId: relation.id,
        action: 'CREATE',
        newValues: { score: 75, involvement: 'FRIEND' },
        changedBy: 'test-script',
        reason: 'Schema validation test'
      }
    })
    console.log('✅ Audit log created for action:', audit.action)

    // Test 9: Query with relationships
    console.log('\n9. Testing relationship queries...')
    const personWithRelations = await prisma.person.findUnique({
      where: { id: person.id },
      include: {
        cohorts: {
          include: {
            cohort: true
          }
        },
        fromRelations: true,
        toRelations: true
      }
    })
    console.log('✅ Person with relationships loaded:', personWithRelations.name)
    console.log('   - Cohorts:', personWithRelations.cohorts.length)
    console.log('   - From relations:', personWithRelations.fromRelations.length)
    console.log('   - To relations:', personWithRelations.toRelations.length)

    console.log('\n🎉 All schema tests passed! The involvement/loyalty v2 schema is working correctly.')

  } catch (error) {
    console.error('❌ Schema test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testInvolvementSchema()
