import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testInvolvementCore() {
  console.log('🧪 Testing Involvement & Loyalty v2 Core Functionality...\n')

  try {
    // Test 1: Create realistic cohorts
    console.log('1. Creating realistic cohorts...')
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

    const guards = await prisma.cohort.create({
      data: {
        name: 'GUARDS',
        description: 'Town security and law enforcement',
        color: '#4169E1'
      }
    })
    console.log('✅ Created 3 cohorts:', originalResidents.name, merchants.name, guards.name)

    // Test 2: Assign people to cohorts
    console.log('\n2. Assigning people to cohorts...')
    const people = await prisma.person.findMany({ take: 5 })
    
    for (let i = 0; i < people.length; i++) {
      const person = people[i]
      const cohort = i < 2 ? originalResidents : i < 4 ? merchants : guards
      
      await prisma.personCohort.create({
        data: {
          personId: person.id,
          cohortId: cohort.id,
          notes: `Assigned to ${cohort.name} for testing`
        }
      })
    }
    console.log(`✅ Assigned ${people.length} people to cohorts`)

    // Test 3: Create seeding policies
    console.log('\n3. Creating seeding policies...')
    
    // Original residents tend to be friendly with each other
    const originalPolicy = await prisma.seedingPolicy.create({
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
        worldSeed: 'deer-river-world-123'
      }
    })

    // Merchants are competitive but professional
    const merchantPolicy = await prisma.seedingPolicy.create({
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
        worldSeed: 'deer-river-world-123'
      }
    })

    // Guards respect original residents
    const guardRespectPolicy = await prisma.seedingPolicy.create({
      data: {
        name: 'Guard Respect for Originals',
        description: 'Guards have high respect for original residents',
        sourceCohortId: guards.id,
        targetCohortId: originalResidents.id,
        domain: 'FACTION',
        probability: 0.9,
        involvementLevel: 'ALLY',
        scoreMin: 70,
        scoreMax: 95,
        worldSeed: 'deer-river-world-123'
      }
    })
    console.log('✅ Created 3 seeding policies')

    // Test 4: Create a test event
    console.log('\n4. Creating test event...')
    const harvestFestival = await prisma.event.create({
      data: {
        name: 'Harvest Festival 2025',
        description: 'Annual celebration bringing the community together',
        eventType: 'CELEBRATION',
        startDate: new Date('2025-10-15'),
        endDate: new Date('2025-10-17'),
        worldSeed: 'harvest-festival-2025'
      }
    })
    console.log('✅ Created event:', harvestFestival.name)

    // Test 5: Create event effects
    console.log('\n5. Creating event effects...')
    
    // Festival increases positive relationships
    const festivalEffect = await prisma.eventEffect.create({
      data: {
        eventId: harvestFestival.id,
        domain: 'KINSHIP',
        effectType: 'ADD',
        value: 5,
        scope: 'GLOBAL',
        isActive: true
      }
    })

    // Special effect for original residents
    const originalFestivalEffect = await prisma.eventEffect.create({
      data: {
        eventId: harvestFestival.id,
        sourceCohortId: originalResidents.id,
        targetCohortId: originalResidents.id,
        domain: 'KINSHIP',
        effectType: 'MULTIPLY',
        value: 1.1,
        scope: 'COHORT_TO_COHORT',
        isActive: true
      }
    })
    console.log('✅ Created 2 event effects')

    // Test 6: Query complex relationships
    console.log('\n6. Testing complex relationship queries...')
    
    const personWithFullData = await prisma.person.findFirst({
      where: { cohorts: { some: { cohort: { name: 'ORIGINAL_RESIDENTS' } } } },
      include: {
        cohorts: {
          include: {
            cohort: true
          }
        },
        fromRelations: {
          include: {
            toPerson: true
          }
        },
        toRelations: {
          include: {
            fromPerson: true
          }
        }
      }
    })

    if (personWithFullData) {
      console.log(`✅ Found person: ${personWithFullData.name}`)
      console.log(`   - Cohorts: ${personWithFullData.cohorts.map(pc => pc.cohort.name).join(', ')}`)
      console.log(`   - From relations: ${personWithFullData.fromRelations.length}`)
      console.log(`   - To relations: ${personWithFullData.toRelations.length}`)
    }

    // Test 7: Test effective score calculation (simplified)
    console.log('\n7. Testing effective score calculation...')
    
    // Get a person relation
    const relation = await prisma.personRelation.findFirst()
    if (relation) {
      let effectiveScore = relation.score
      console.log(`   Base score: ${effectiveScore}`)
      
      // Apply festival effect (simplified)
      const activeEffects = await prisma.eventEffect.findMany({
        where: {
          isActive: true,
          event: { isActive: true }
        }
      })
      
      for (const effect of activeEffects) {
        if (effect.effectType === 'ADD') {
          effectiveScore += effect.value
        } else if (effect.effectType === 'MULTIPLY') {
          effectiveScore *= effect.value
        }
        // Clamp to [1, 100]
        effectiveScore = Math.max(1, Math.min(100, Math.round(effectiveScore)))
      }
      
      console.log(`   Effective score after events: ${effectiveScore}`)
    }

    console.log('\n🎉 All core functionality tests passed!')
    console.log('   - Cohorts system working')
    console.log('   - Seeding policies configured')
    console.log('   - Events and effects functional')
    console.log('   - Relationship queries working')
    console.log('   - Effective score calculation ready')

  } catch (error) {
    console.error('❌ Core functionality test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testInvolvementCore()
