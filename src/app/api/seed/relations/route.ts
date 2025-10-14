import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import seedrandom from 'seedrandom'

const prisma = new PrismaClient()

// Utility functions
function clampScore(score: number): number {
  return Math.max(1, Math.min(100, Math.round(score)))
}

function getDeterministicRandom(seed: string): () => number {
  return seedrandom(seed)
}

function generatePairKey(fromPersonId: string, toPersonId: string): string {
  const [first, second] = [fromPersonId, toPersonId].sort()
  return `${first}-${second}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { worldSeed = 'default-world', dryRun = false } = body

    console.log(`🌱 Starting relationship seeding with world seed: ${worldSeed}`)

    // Get all active seeding policies
    const policies = await prisma.seedingPolicy.findMany({
      where: { isActive: true },
      include: {
        sourceCohort: true,
        targetCohort: true
      }
    })

    console.log(`📋 Found ${policies.length} active seeding policies`)

    const result = {
      success: true,
      relationshipsCreated: 0,
      errors: [] as string[],
      details: [] as Array<{ policyName: string; relationshipsCreated: number; errors: string[] }>
    }

    for (const policy of policies) {
      console.log(`\n🔄 Processing policy: ${policy.name}`)
      
      try {
        const policyResult = await seedPolicyRelationships(policy, worldSeed, dryRun)
        result.relationshipsCreated += policyResult.relationshipsGenerated
        result.details.push({
          policyName: policy.name,
          sourceCohort: policy.sourceCohort.name,
          targetCohort: policy.targetCohort.name,
          relationshipsGenerated: policyResult.relationshipsGenerated
        })
        
        console.log(`✅ Generated ${policyResult.relationshipsGenerated} relationships for ${policy.name}`)
      } catch (error) {
        const errorMsg = `Failed to process policy ${policy.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        result.errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    console.log(`\n🎉 Seeding complete! Created ${result.relationshipsCreated} relationships`)

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        relationshipsCreated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: []
      }, 
      { status: 500 }
    )
  }
}

async function seedPolicyRelationships(
  policy: { id: string; name: string; sourceCohortId: string; targetCohortId: string; domain: string; probability: number; involvementLevel: string; scoreMin: number; scoreMax: number },
  worldSeed: string,
  dryRun: boolean
): Promise<{ relationshipsGenerated: number }> {
  // Get people in source cohort
  const sourcePeople = await prisma.person.findMany({
    where: {
      cohorts: {
        some: {
          cohortId: policy.sourceCohortId
        }
      }
    }
  })

  // Get people in target cohort
  const targetPeople = await prisma.person.findMany({
    where: {
      cohorts: {
        some: {
          cohortId: policy.targetCohortId
        }
      }
    }
  })

  console.log(`   Source cohort: ${sourcePeople.length} people`)
  console.log(`   Target cohort: ${targetPeople.length} people`)

  let relationshipsGenerated = 0

  // Generate relationships for each source-target pair
  for (const sourcePerson of sourcePeople) {
    for (const targetPerson of targetPeople) {
      // Skip self-relationships
      if (sourcePerson.id === targetPerson.id) continue

      // Create deterministic seed for this pair
      const pairSeed = `${worldSeed}-${policy.id}-${generatePairKey(sourcePerson.id, targetPerson.id)}`
      const random = getDeterministicRandom(pairSeed)

      // Check if relationship should be created based on probability
      if (random() > policy.probability) continue

      // Check if relationship already exists
      const existingRelation = await prisma.personRelation.findUnique({
        where: {
          fromPersonId_toPersonId_domain: {
            fromPersonId: sourcePerson.id,
            toPersonId: targetPerson.id,
            domain: policy.domain
          }
        }
      })

      if (existingRelation) continue

      // Generate score within the specified range
      const scoreRange = policy.scoreMax - policy.scoreMin
      const randomScore = policy.scoreMin + (random() * scoreRange)
      const score = clampScore(randomScore)

      if (!dryRun) {
        // Create the relationship
        const relation = await prisma.personRelation.create({
          data: {
            fromPersonId: sourcePerson.id,
            toPersonId: targetPerson.id,
            domain: policy.domain,
            involvement: policy.involvementLevel,
            score: score,
            provenance: 'SEEDED',
            sourceRef: {
              policyId: policy.id,
              policyName: policy.name,
              worldSeed: worldSeed,
              pairSeed: pairSeed
            }
          }
        })

        // Create audit log
        await prisma.personRelationAudit.create({
          data: {
            relationId: relation.id,
            action: 'CREATE',
            newValues: {
              fromPersonId: sourcePerson.id,
              toPersonId: targetPerson.id,
              domain: policy.domain,
              involvement: policy.involvementLevel,
              score: score,
              provenance: 'SEEDED'
            },
            changedBy: 'seeding-algorithm',
            reason: `Seeded by policy: ${policy.name}`
          }
        })
      }

      relationshipsGenerated++
    }
  }

  return { relationshipsGenerated }
}
