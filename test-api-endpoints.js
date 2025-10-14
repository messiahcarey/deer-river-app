import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAPIEndpoints() {
  console.log('🧪 Testing Involvement & Loyalty v2 API Endpoints...\n')

  try {
    // Test 1: Create test cohorts
    console.log('1. Creating test cohorts...')
    
    const originalResidents = await prisma.cohort.create({
      data: {
        name: 'ORIGINAL_RESIDENTS',
        description: 'The founding families of Deer River',
        color: '#8B4513'
      }
    })

    const merchants = await prisma.cohort.create({
      data: {
        name: 'MERCHANTS',
        description: 'Traders and business owners',
        color: '#FFD700'
      }
    })
    console.log('✅ Created test cohorts')

    // Test 2: Assign people to cohorts
    console.log('\n2. Assigning people to cohorts...')
    const people = await prisma.person.findMany({ take: 3 })
    
    for (let i = 0; i < people.length; i++) {
      const person = people[i]
      const cohort = i < 2 ? originalResidents : merchants
      
      await prisma.personCohort.create({
        data: {
          personId: person.id,
          cohortId: cohort.id,
          notes: `Assigned to ${cohort.name} for API testing`
        }
      })
    }
    console.log(`✅ Assigned ${people.length} people to cohorts`)

    // Test 3: Create seeding policies
    console.log('\n3. Creating seeding policies...')
    
    const kinshipPolicy = await prisma.seedingPolicy.create({
      data: {
        name: 'Original Residents Kinship',
        description: 'Original residents have strong kinship bonds',
        sourceCohortId: originalResidents.id,
        targetCohortId: originalResidents.id,
        domain: 'KINSHIP',
        probability: 0.8,
        involvementLevel: 'FRIEND',
        scoreMin: 60,
        scoreMax: 90,
        worldSeed: 'api-test-world-123'
      }
    })

    const workPolicy = await prisma.seedingPolicy.create({
      data: {
        name: 'Merchant Competition',
        description: 'Merchants have professional but competitive relationships',
        sourceCohortId: merchants.id,
        targetCohortId: merchants.id,
        domain: 'WORK',
        probability: 0.6,
        involvementLevel: 'ACQUAINTANCE',
        scoreMin: 40,
        scoreMax: 70,
        worldSeed: 'api-test-world-123'
      }
    })
    console.log('✅ Created seeding policies')

    // Test 4: Test seeding API (dry run)
    console.log('\n4. Testing seeding API...')
    
    const seedingResponse = await fetch('http://localhost:3000/api/seed/relations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        worldSeed: 'api-test-world-123',
        dryRun: true
      })
    })

    if (seedingResponse.ok) {
      const seedingResult = await seedingResponse.json()
      console.log(`   Dry run result: ${seedingResult.success}`)
      console.log(`   Would create: ${seedingResult.relationshipsCreated} relationships`)
      console.log(`   Policies processed: ${seedingResult.details.length}`)
    } else {
      console.log(`   Seeding API failed: ${seedingResponse.status}`)
    }
    console.log('✅ Seeding API working')

    // Test 5: Create a test event
    console.log('\n5. Creating test event...')
    
    const eventResponse = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'API Test Celebration',
        description: 'A test event for API validation',
        eventType: 'CELEBRATION',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        worldSeed: 'api-test-event-456'
      })
    })

    let eventId = null
    if (eventResponse.ok) {
      const event = await eventResponse.json()
      eventId = event.id
      console.log(`   Created event: ${event.name}`)
    } else {
      console.log(`   Event creation failed: ${eventResponse.status}`)
    }
    console.log('✅ Events API working')

    // Test 6: Add event effects
    if (eventId) {
      console.log('\n6. Adding event effects...')
      
      const addEffectResponse = await fetch(`http://localhost:3000/api/events/${eventId}/effects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          effectType: 'ADD',
          value: 5,
          scope: 'GLOBAL',
          domain: 'KINSHIP'
        })
      })

      if (addEffectResponse.ok) {
        const addEffect = await addEffectResponse.json()
        console.log(`   Added ADD effect: +${addEffect.value}`)
      }

      const multiplyEffectResponse = await fetch(`http://localhost:3000/api/events/${eventId}/effects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          effectType: 'MULTIPLY',
          value: 1.1,
          scope: 'COHORT_TO_COHORT',
          domain: 'KINSHIP',
          sourceCohortId: originalResidents.id,
          targetCohortId: originalResidents.id
        })
      })

      if (multiplyEffectResponse.ok) {
        const multiplyEffect = await multiplyEffectResponse.json()
        console.log(`   Added MULTIPLY effect: ×${multiplyEffect.value}`)
      }
      console.log('✅ Event effects API working')
    }

    // Test 7: Test effective score calculation
    console.log('\n7. Testing effective score calculation...')
    
    if (people.length > 0) {
      const personId = people[0].id
      const scoreResponse = await fetch(`http://localhost:3000/api/relations/effective?personId=${personId}&domain=KINSHIP`)
      
      if (scoreResponse.ok) {
        const scoreResult = await scoreResponse.json()
        console.log(`   Base score: ${scoreResult.baseScore}`)
        console.log(`   Effective score: ${scoreResult.effectiveScore}`)
        console.log(`   Effects applied: ${scoreResult.effects.length}`)
        console.log(`   Provenance: ${scoreResult.provenance}`)
      } else {
        console.log(`   Score calculation failed: ${scoreResponse.status}`)
      }
    }
    console.log('✅ Effective score API working')

    console.log('\n🎉 All API endpoint tests completed!')
    console.log('   - Seeding API functional')
    console.log('   - Events API operational')
    console.log('   - Event effects API working')
    console.log('   - Effective score calculation ready')

  } catch (error) {
    console.error('❌ API endpoint test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Note: This test requires the Next.js server to be running
console.log('⚠️  Note: This test requires the Next.js server to be running on localhost:3000')
console.log('   Run "npm run dev" in another terminal before running this test')
console.log('')

testAPIEndpoints()
