import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Utility function
function clampScore(score: number): number {
  return Math.max(1, Math.min(100, Math.round(score)))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const personId = searchParams.get('personId')
    const domain = searchParams.get('domain')

    if (!personId || !domain) {
      return NextResponse.json(
        { error: 'personId and domain are required' },
        { status: 400 }
      )
    }

    // Get the base relationship
    const relation = await prisma.personRelation.findUnique({
      where: {
        fromPersonId_toPersonId_domain: {
          fromPersonId: personId,
          toPersonId: personId, // For now, we'll use the same person for testing
          domain: domain
        }
      }
    })

    if (!relation) {
      return NextResponse.json({
        baseScore: 0,
        effectiveScore: 0,
        effects: [],
        provenance: 'NO_RELATIONSHIP'
      })
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
          { fromPersonId: personId }, // Person-specific effects
          { toPersonId: personId }
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
          (effect.scope === 'COHORT_TO_COHORT' && await checkCohortEffect(effect, personId, personId)) ||
          (effect.scope === 'PERSON_TO_PERSON' && effect.fromPersonId === personId && effect.toPersonId === personId)) {
        
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

    return NextResponse.json({
      baseScore: relation.score,
      effectiveScore: clampScore(effectiveScore),
      effects,
      provenance: relation.provenance
    })

  } catch (error) {
    console.error('❌ Effective score calculation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
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
