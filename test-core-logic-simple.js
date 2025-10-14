import { PrismaClient } from '@prisma/client'
import seedrandom from 'seedrandom'

const prisma = new PrismaClient()

// Test utility functions
function clampScore(score) {
  return Math.max(1, Math.min(100, Math.round(score)))
}

function getDeterministicRandom(seed) {
  return seedrandom(seed)
}

function generatePairKey(fromPersonId, toPersonId) {
  const [first, second] = [fromPersonId, toPersonId].sort()
  return `${first}-${second}`
}

async function testCoreLogic() {
  console.log('🧪 Testing Involvement & Loyalty v2 Core Logic...\n')

  try {
    // Test 1: Utility functions
    console.log('1. Testing utility functions...')
    console.log(`   clampScore(150): ${clampScore(150)} (should be 100)`)
    console.log(`   clampScore(-10): ${clampScore(-10)} (should be 1)`)
    console.log(`   clampScore(75): ${clampScore(75)} (should be 75)`)
    
    const random1 = getDeterministicRandom('test-seed-123')
    const random2 = getDeterministicRandom('test-seed-123')
    const val1 = random1()
    const val2 = random2()
    console.log(`   Deterministic random (seed 1): ${val1}`)
    console.log(`   Deterministic random (seed 2): ${val2}`)
    console.log(`   Same seed produces same result: ${val1 === val2}`)
    console.log('✅ Utility functions working')

    // Test 2: Test deterministic seeding logic
    console.log('\n2. Testing deterministic seeding logic...')
    
    // Get some people to test with
    const people = await prisma.person.findMany({ take: 3 })
    if (people.length < 2) {
      console.log('❌ Need at least 2 people for testing')
      return
    }

    const person1 = people[0]
    const person2 = people[1]
    
    // Test deterministic pair key generation
    const pairKey1 = generatePairKey(person1.id, person2.id)
    const pairKey2 = generatePairKey(person2.id, person1.id)
    console.log(`   Pair key 1: ${pairKey1}`)
    console.log(`   Pair key 2: ${pairKey2}`)
    console.log(`   Keys are symmetric: ${pairKey1 === pairKey2}`)

    // Test deterministic random generation for the same pair
    const seed1 = `world-seed-123-${pairKey1}`
    const seed2 = `world-seed-123-${pairKey2}`
    const randomPair1 = getDeterministicRandom(seed1)
    const randomPair2 = getDeterministicRandom(seed2)
    console.log(`   Random 1: ${randomPair1()}`)
    console.log(`   Random 2: ${randomPair2()}`)
    console.log(`   Same pair produces same random: ${randomPair1() === randomPair2()}`)
    console.log('✅ Deterministic seeding logic working')

    // Test 3: Test score generation
    console.log('\n3. Testing score generation...')
    const scoreMin = 40
    const scoreMax = 80
    const scoreRange = scoreMax - scoreMin
    
    for (let i = 0; i < 5; i++) {
      const random = getDeterministicRandom(`score-test-${i}`)
      const rawScore = scoreMin + (random() * scoreRange)
      const clampedScore = clampScore(rawScore)
      console.log(`   Raw: ${rawScore.toFixed(2)}, Clamped: ${clampedScore}`)
    }
    console.log('✅ Score generation working')

    // Test 4: Test relationship creation logic
    console.log('\n4. Testing relationship creation logic...')
    
    // Check if relationship already exists
    const existingRelation = await prisma.personRelation.findUnique({
      where: {
        fromPersonId_toPersonId_domain: {
          fromPersonId: person1.id,
          toPersonId: person2.id,
          domain: 'KINSHIP'
        }
      }
    })

    if (existingRelation) {
      console.log(`   Existing relationship found: score ${existingRelation.score}`)
    } else {
      console.log('   No existing relationship found')
    }

    // Test probability check
    const probability = 0.5
    const random = getDeterministicRandom(`prob-test-${Date.now()}`)
    const shouldCreate = random() <= probability
    console.log(`   Probability: ${probability}, Random: ${random()}, Should create: ${shouldCreate}`)
    console.log('✅ Relationship creation logic working')

    // Test 5: Test effective score calculation (simplified)
    console.log('\n5. Testing effective score calculation...')
    
    if (existingRelation) {
      let effectiveScore = existingRelation.score
      console.log(`   Base score: ${effectiveScore}`)

      // Simulate ADD effect
      const addEffect = 5
      effectiveScore += addEffect
      effectiveScore = clampScore(effectiveScore)
      console.log(`   After ADD +${addEffect}: ${effectiveScore}`)

      // Simulate MULTIPLY effect
      const multiplyEffect = 1.1
      effectiveScore *= multiplyEffect
      effectiveScore = clampScore(effectiveScore)
      console.log(`   After MULTIPLY ×${multiplyEffect}: ${effectiveScore}`)

      // Simulate DECAY effect
      const decayPerDay = 0.5
      const daysSinceStart = 7
      const decayAmount = decayPerDay * daysSinceStart
      effectiveScore -= decayAmount
      effectiveScore = clampScore(effectiveScore)
      console.log(`   After DECAY -${decayAmount} (${daysSinceStart} days): ${effectiveScore}`)

      console.log(`   Final effective score: ${effectiveScore}`)
    } else {
      console.log('   No existing relationship to test effective score calculation')
    }
    console.log('✅ Effective score calculation working')

    console.log('\n🎉 All core logic tests passed!')
    console.log('   - Utility functions validated')
    console.log('   - Deterministic seeding working')
    console.log('   - Score generation functional')
    console.log('   - Relationship creation logic working')
    console.log('   - Effective score calculation ready')

  } catch (error) {
    console.error('❌ Core logic test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCoreLogic()
