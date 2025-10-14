import { PrismaClient } from '@prisma/client'
import seedrandom from 'seedrandom'

const prisma = new PrismaClient()

// ===== TYPES =====

export interface SeedingResult {
  success: boolean
  relationshipsCreated: number
  errors: string[]
  details: {
    policyName: string
    sourceCohort: string
    targetCohort: string
    relationshipsGenerated: number
  }[]
}

export interface EffectiveScoreResult {
  baseScore: number
  effectiveScore: number
  effects: {
    type: string
    value: number
    description: string
  }[]
  provenance: string
}

export interface EventEffectResult {
  eventName: string
  effectType: string
  value: number
  scope: string
  applied: boolean
}

// ===== UTILITY FUNCTIONS =====

/**
 * Clamp a score to the valid range [1, 100]
 */
export function clampScore(score: number): number {
  return Math.max(1, Math.min(100, Math.round(score)))
}

/**
 * Generate a deterministic random number using seedrandom
 */
export function getDeterministicRandom(seed: string): () => number {
  return seedrandom(seed)
}

/**
 * Generate a unique pair key for deterministic seeding
 */
export function generatePairKey(fromPersonId: string, toPersonId: string): string {
  // Ensure consistent ordering for symmetric relationships
  const [first, second] = [fromPersonId, toPersonId].sort()
  return `${first}-${second}`
}

// ===== SEEDING ALGORITHM =====

/**
 * Seed relationships based on active seeding policies
 */
export async function seedRelationships(
  worldSeed: string = 'default-world',
  dryRun: boolean = false
): Promise<SeedingResult> {
  const result: SeedingResult = {
    success: true,
    relationshipsCreated: 0,
    errors: [],
    details: []
  }

  try {
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
    return result

  } catch (error) {
    result.success = false
    result.errors.push(`Seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    console.error('❌ Seeding failed:', error)
    return result
  }
}

/**
 * Seed relationships for a specific policy
 */
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
        await prisma.personRelation.create({
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
            relationId: '', // Will be filled after creation
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

// ===== EFFECTIVE SCORE CALCULATION =====

/**
 * Calculate the effective score for a relationship, applying all active effects
 */
export async function calculateEffectiveScore(
  fromPersonId: string,
  toPersonId: string,
  domain: string
): Promise<EffectiveScoreResult> {
  // Get the base relationship
  const relation = await prisma.personRelation.findUnique({
    where: {
      fromPersonId_toPersonId_domain: {
        fromPersonId,
        toPersonId,
        domain
      }
    }
  })

  if (!relation) {
    return {
      baseScore: 0,
      effectiveScore: 0,
      effects: [],
      provenance: 'NO_RELATIONSHIP'
    }
  }

  let effectiveScore = relation.score
  const effects: { type: string; value: number; description: string }[] = []

  // Get all active event effects that could apply
  const eventEffects = await prisma.eventEffect.findMany({
    where: {
      isActive: true,
      event: { isActive: true },
      OR: [
        { domain: null }, // Global effects
        { domain: domain }, // Domain-specific effects
        { fromPersonId: fromPersonId }, // Person-specific effects
        { toPersonId: toPersonId }
      ]
    },
    include: {
      event: true
    }
  })

  // Apply effects in order
  for (const effect of eventEffects) {
    let applied = false
    const effectValue = effect.value

    // Check if effect applies to this specific relationship
    if (effect.scope === 'GLOBAL' || 
        (effect.scope === 'COHORT_TO_COHORT' && await checkCohortEffect(effect, fromPersonId, toPersonId)) ||
        (effect.scope === 'PERSON_TO_PERSON' && effect.fromPersonId === fromPersonId && effect.toPersonId === toPersonId)) {
      
      applied = true
      
      if (effect.effectType === 'ADD') {
        effectiveScore += effectValue
        effects.push({
          type: 'ADD',
          value: effectValue,
          description: `${effect.event.name}: +${effectValue}`
        })
      } else if (effect.effectType === 'MULTIPLY') {
        effectiveScore *= effectValue
        effects.push({
          type: 'MULTIPLY',
          value: effectValue,
          description: `${effect.event.name}: ×${effectValue}`
        })
      } else if (effect.effectType === 'DECAY') {
        // Calculate decay based on time since event start
        const daysSinceStart = Math.floor((Date.now() - effect.event.startDate.getTime()) / (1000 * 60 * 60 * 24))
        const decayAmount = (effect.decayPerDay || 0) * daysSinceStart
        effectiveScore -= decayAmount
        effects.push({
          type: 'DECAY',
          value: -decayAmount,
          description: `${effect.event.name}: -${decayAmount} (${daysSinceStart} days)`
        })
      }
    }

    if (applied) {
      // Clamp the score after each effect
      effectiveScore = clampScore(effectiveScore)
    }
  }

  return {
    baseScore: relation.score,
    effectiveScore: clampScore(effectiveScore),
    effects,
    provenance: relation.provenance
  }
}

/**
 * Check if a cohort-to-cohort effect applies to a person pair
 */
async function checkCohortEffect(effect: { sourceCohortId: string | null; targetCohortId: string | null }, fromPersonId: string, toPersonId: string): Promise<boolean> {
  if (!effect.sourceCohortId || !effect.targetCohortId) return false

  const fromPersonCohorts = await prisma.personCohort.findMany({
    where: { personId: fromPersonId, cohortId: effect.sourceCohortId }
  })

  const toPersonCohorts = await prisma.personCohort.findMany({
    where: { personId: toPersonId, cohortId: effect.targetCohortId }
  })

  return fromPersonCohorts.length > 0 && toPersonCohorts.length > 0
}

// ===== EVENTS SYSTEM =====

/**
 * Create a new event with effects
 */
export async function createEvent(
  name: string,
  description: string,
  eventType: string,
  startDate: Date,
  endDate?: Date,
  worldSeed?: string
): Promise<{ id: string; name: string; description: string | null; eventType: string; startDate: Date; endDate: Date | null; isActive: boolean; worldSeed: string | null; createdAt: Date; updatedAt: Date }> {
  return await prisma.event.create({
    data: {
      name,
      description,
      eventType,
      startDate,
      endDate,
      worldSeed,
      isActive: true
    }
  })
}

/**
 * Add an effect to an event
 */
export async function addEventEffect(
  eventId: string,
  effectType: 'ADD' | 'MULTIPLY' | 'DECAY',
  value: number,
  scope: 'GLOBAL' | 'COHORT_TO_COHORT' | 'PERSON_TO_PERSON',
  options: {
    domain?: string
    sourceCohortId?: string
    targetCohortId?: string
    fromPersonId?: string
    toPersonId?: string
    decayPerDay?: number
  } = {}
): Promise<{ id: string; eventId: string; sourceCohortId: string | null; targetCohortId: string | null; fromPersonId: string | null; toPersonId: string | null; domain: string | null; effectType: string; value: number; decayPerDay: number | null; scope: string; isActive: boolean; createdAt: Date; updatedAt: Date }> {
  return await prisma.eventEffect.create({
    data: {
      eventId,
      domain: options.domain || null,
      effectType,
      value,
      scope,
      sourceCohortId: options.sourceCohortId || null,
      targetCohortId: options.targetCohortId || null,
      fromPersonId: options.fromPersonId || null,
      toPersonId: options.toPersonId || null,
      decayPerDay: options.decayPerDay || null,
      isActive: true
    }
  })
}

// ===== EXPORT UTILITIES =====

export { prisma }
