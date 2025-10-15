// Loyalty Scoring Service for v3 Model
import { PrismaClient } from '@prisma/client'
import type {
  LoyaltyBreakdown,
  ScoringResult,
  ScoringConfig
} from '@/types/scoring'

export class LoyaltyScoringService {
  private prisma: PrismaClient
  private config: ScoringConfig

  constructor(prisma: PrismaClient, config?: Partial<ScoringConfig>) {
    this.prisma = prisma
    this.config = {
      weights: {
        involvement: {
          roleActivity: 0.35,
          eventParticipation: 0.25,
          networkCentrality: 0.20,
          initiative: 0.10,
          reliability: 0.10
        },
        loyalty: {
          identityFit: 0.25,
          benefitFlow: 0.25,
          sharedHistory: 0.20,
          pressureCost: 0.15,
          satisfaction: 0.15
        }
      },
      window: {
        days: 180,
        decayFactor: 0.90
      },
      enableDecay: true,
      minScore: 0.0,
      maxScore: 1.0,
      ...config
    }
  }

  /**
   * Calculate loyalty score for a person to a target (faction or person)
   * Formula: L(target) = 0.25*IF + 0.25*BF + 0.20*SH + 0.15*PC + 0.15*SA
   */
  async calculateLoyaltyScore(personId: string, targetId: string): Promise<ScoringResult> {
    const breakdown: LoyaltyBreakdown = {
      identityFit: await this.calculateIdentityFit(personId, targetId),
      benefitFlow: await this.calculateBenefitFlow(personId, targetId),
      sharedHistory: await this.calculateSharedHistory(personId, targetId),
      pressureCost: await this.calculatePressureCost(personId, targetId),
      satisfaction: await this.calculateSatisfaction(personId, targetId)
    }

    const score = this.calculateWeightedScore(breakdown)
    const clampedScore = this.clampScore(score)

    return {
      score: clampedScore,
      breakdown,
      window: `${this.config.window.days}d`,
      calculatedAt: new Date(),
      metadata: {
        weights: this.config.weights.loyalty,
        decayEnabled: this.config.enableDecay,
        targetId
      }
    }
  }

  /**
   * Calculate Identity Fit (IF) component
   * Based on kinship/household overlap and cultural/ideological affinity
   */
  private async calculateIdentityFit(personId: string, targetId: string): Promise<number> {
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
      include: {
        household: true,
        memberships: {
          include: { faction: true }
        }
      }
    })

    if (!person) return 0.0

    let identityFit = 0.0

    // Check if target is a faction
    const targetFaction = await this.prisma.faction.findUnique({
      where: { id: targetId }
    })

    if (targetFaction) {
      // Factor 1: Faction membership
      const membership = person.memberships.find(m => m.factionId === targetId)
      if (membership) {
        identityFit += 0.6 // Base membership bonus
        
        // Factor in role importance
        const roleWeight = this.getRoleWeight(membership.role)
        identityFit += roleWeight * 0.3
      }

      // Factor 2: Species alignment (simplified)
      const speciesAlignment = this.getSpeciesAlignment(person.species, targetFaction.name)
      identityFit += speciesAlignment * 0.2

      // Factor 3: Household overlap with faction members
      const householdOverlap = await this.calculateHouseholdOverlap(personId, targetId)
      identityFit += householdOverlap * 0.1
    } else {
      // Target is a person - calculate person-to-person identity fit
      const targetPerson = await this.prisma.person.findUnique({
        where: { id: targetId },
        include: { household: true }
      })

      if (targetPerson) {
        // Factor 1: Species similarity
        if (person.species === targetPerson.species) {
          identityFit += 0.4
        }

        // Factor 2: Household overlap
        if (person.householdId === targetPerson.householdId) {
          identityFit += 0.5
        }

        // Factor 3: Age similarity (simplified)
        if (person.age && targetPerson.age) {
          const ageDiff = Math.abs(person.age - targetPerson.age)
          const ageSimilarity = Math.max(0, 1 - ageDiff / 50) // 50 years = 0 similarity
          identityFit += ageSimilarity * 0.1
        }
      }
    }

    return this.clampScore(identityFit)
  }

  /**
   * Calculate Benefit Flow (BF) component
   * Based on material/social benefits from the target
   */
  private async calculateBenefitFlow(personId: string, targetId: string): Promise<number> {
    let benefitFlow = 0.0

    // Check if target is a faction
    const targetFaction = await this.prisma.faction.findUnique({
      where: { id: targetId }
    })

    if (targetFaction) {
      // Factor 1: Employment benefits
      const person = await this.prisma.person.findUnique({
        where: { id: personId },
        include: {
          workplace: true,
          memberships: {
            where: { factionId: targetId }
          }
        }
      })

      if (person) {
        // Factor in faction membership benefits
        if (person.memberships.length > 0) {
          const membership = person.memberships[0]
          const benefitLevel = this.getFactionBenefitLevel(targetFaction.name)
          benefitFlow += benefitLevel * 0.6

          // Factor in role-based benefits
          const roleBenefit = this.getRoleBenefit(membership.role)
          benefitFlow += roleBenefit * 0.3
        }

        // Factor in workplace benefits
        if (person.workplace) {
          const workplaceBenefit = this.getWorkplaceBenefit(person.workplace.type)
          benefitFlow += workplaceBenefit * 0.1
        }
      }
    } else {
      // Target is a person - calculate person-to-person benefits
      // This would typically come from relationship tracking
      // For now, use a simplified calculation
      const relationship = await this.prisma.relationship.findFirst({
        where: {
          OR: [
            { srcId: personId, dstId: targetId },
            { srcId: targetId, dstId: personId }
          ],
          kind: 'PATRONAGE'
        }
      })

      if (relationship) {
        benefitFlow += relationship.weight * 0.8
      }
    }

    return this.clampScore(benefitFlow)
  }

  /**
   * Calculate Shared History (SH) component
   * Based on length/depth of past cooperation
   */
  private async calculateSharedHistory(personId: string, targetId: string): Promise<number> {
    let sharedHistory = 0.0

    // Factor 1: Relationship duration
    const relationships = await this.prisma.relationship.findMany({
      where: {
        OR: [
          { srcId: personId, dstId: targetId },
          { srcId: targetId, dstId: personId }
        ]
      }
    })

    for (const relationship of relationships) {
      const duration = now.getTime() - relationship.createdAt.getTime()
      const durationDays = duration / (1000 * 60 * 60 * 24)
      const durationWeight = Math.min(durationDays / 365, 1.0) // Max 1 year = full weight
      
      sharedHistory += relationship.weight * durationWeight * 0.5
    }

    // Factor 2: Event co-participation
    // Simplified: assume co-participation based on faction membership
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
      include: {
        memberships: {
          include: { faction: true }
        }
      }
    })

    if (person) {
      const targetFaction = await this.prisma.faction.findUnique({
        where: { id: targetId }
      })

      if (targetFaction) {
        const membership = person.memberships.find(m => m.factionId === targetId)
        if (membership) {
          const cooperationLength = now.getTime() - membership.joinedAt.getTime()
          const cooperationDays = cooperationLength / (1000 * 60 * 60 * 24)
          const cooperationWeight = Math.min(cooperationDays / 365, 1.0)
          
          sharedHistory += cooperationWeight * 0.3
        }
      }
    }

    return this.clampScore(sharedHistory)
  }

  /**
   * Calculate Pressure/Cost (PC) component
   * Based on penalties if defecting and risk of retaliation
   */
  private async calculatePressureCost(personId: string, targetId: string): Promise<number> {
    let pressureCost = 0.0

    // Check if target is a faction
    const targetFaction = await this.prisma.faction.findUnique({
      where: { id: targetId }
    })

    if (targetFaction) {
      const person = await this.prisma.person.findUnique({
        where: { id: personId },
        include: {
          memberships: {
            where: { factionId: targetId }
          }
        }
      })

      if (person && person.memberships.length > 0) {
        const membership = person.memberships[0]
        
        // Factor 1: Role-based pressure
        const rolePressure = this.getRolePressure(membership.role)
        pressureCost += rolePressure * 0.4

        // Factor 2: Faction power level
        const factionPower = this.getFactionPowerLevel(targetFaction.name)
        pressureCost += factionPower * 0.3

        // Factor 3: Membership duration (longer = more pressure)
        const duration = Date.now() - membership.joinedAt.getTime()
        const durationDays = duration / (1000 * 60 * 60 * 24)
        const durationPressure = Math.min(durationDays / 365, 1.0) * 0.3
        pressureCost += durationPressure
      }
    } else {
      // Target is a person - calculate person-to-person pressure
      // This would typically come from relationship analysis
      // For now, use a simplified calculation
      const relationship = await this.prisma.relationship.findFirst({
        where: {
          OR: [
            { srcId: personId, dstId: targetId },
            { srcId: targetId, dstId: personId }
          ],
          kind: 'COMMAND'
        }
      })

      if (relationship) {
        pressureCost += relationship.weight * 0.6
      }
    }

    return this.clampScore(pressureCost)
  }

  /**
   * Calculate Satisfaction (SA) component
   * Based on sentiment of recent interactions
   */
  private async calculateSatisfaction(personId: string, targetId: string): Promise<number> {
    const now = new Date()
    const windowStart = new Date(now.getTime() - this.config.window.days * 24 * 60 * 60 * 1000)

    let satisfaction = 0.5 // Base neutral satisfaction

    // Factor 1: Relationship sentiment
    const relationships = await this.prisma.relationship.findMany({
      where: {
        OR: [
          { srcId: personId, dstId: targetId },
          { srcId: targetId, dstId: personId }
        ],
        createdAt: {
          gte: windowStart
        }
      }
    })

    for (const relationship of relationships) {
      const sentiment = relationship.sentiment || 0
      const timeWeight = this.calculateTimeWeight(relationship.createdAt, null, now)
      satisfaction += sentiment * timeWeight * 0.3
    }

    // Factor 2: Faction alignment (if target is faction)
    const targetFaction = await this.prisma.faction.findUnique({
      where: { id: targetId }
    })

    if (targetFaction) {
      const person = await this.prisma.person.findUnique({
        where: { id: personId },
        include: {
          memberships: {
            where: { factionId: targetId }
          }
        }
      })

      if (person && person.memberships.length > 0) {
        const membership = person.memberships[0]
        const alignment = membership.alignment / 100 // Convert from -100..100 to -1..1
        satisfaction += alignment * 0.4
      }
    }

    return this.clampScore(satisfaction)
  }

  /**
   * Calculate weighted score from breakdown
   */
  private calculateWeightedScore(breakdown: LoyaltyBreakdown): number {
    const weights = this.config.weights.loyalty
    return (
      breakdown.identityFit * weights.identityFit +
      breakdown.benefitFlow * weights.benefitFlow +
      breakdown.sharedHistory * weights.sharedHistory +
      breakdown.pressureCost * weights.pressureCost +
      breakdown.satisfaction * weights.satisfaction
    )
  }

  /**
   * Clamp score to valid range
   */
  private clampScore(score: number): number {
    return Math.max(this.config.minScore, Math.min(this.config.maxScore, score))
  }

  /**
   * Calculate time weight with exponential decay
   */
  private calculateTimeWeight(startDate: Date, endDate: Date | null, now: Date): number {
    if (!this.config.enableDecay) return 1.0

    const end = endDate || now
    const daysAgo = (now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24)
    const weeksAgo = daysAgo / 7
    
    return Math.pow(this.config.window.decayFactor, weeksAgo)
  }

  /**
   * Calculate household overlap with faction members
   */
  private async calculateHouseholdOverlap(personId: string, factionId: string): Promise<number> {
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
      include: { household: true }
    })

    if (!person?.householdId) return 0.0

    const factionMembers = await this.prisma.person.findMany({
      where: {
        memberships: {
          some: { factionId }
        }
      },
      include: { household: true }
    })

    const householdMembers = factionMembers.filter(m => m.householdId === person.householdId)
    return Math.min(householdMembers.length / Math.max(factionMembers.length, 1), 1.0)
  }

  /**
   * Get species alignment with faction
   */
  private getSpeciesAlignment(species: string, factionName: string): number {
    // Simplified species-faction alignment
    const alignments: Record<string, Record<string, number>> = {
      'human': {
        'town guard': 0.8,
        'council': 0.9,
        'merchants guild': 0.7,
        'craftsmen': 0.6
      },
      'elf': {
        'council': 0.8,
        'craftsmen': 0.9,
        'merchants guild': 0.6
      },
      'dwarf': {
        'craftsmen': 0.9,
        'merchants guild': 0.8,
        'town guard': 0.7
      }
    }
    return alignments[species.toLowerCase()]?.[factionName.toLowerCase()] || 0.5
  }

  /**
   * Get faction benefit level
   */
  private getFactionBenefitLevel(factionName: string): number {
    const benefits: Record<string, number> = {
      'town guard': 0.9,
      'council': 0.8,
      'merchants guild': 0.7,
      'craftsmen': 0.6,
      'farmers': 0.4,
      'refugees': 0.2
    }
    return benefits[factionName.toLowerCase()] || 0.3
  }

  /**
   * Get role benefit level
   */
  private getRoleBenefit(role: string): number {
    const benefits: Record<string, number> = {
      'leader': 1.0,
      'officer': 0.8,
      'sergeant': 0.7,
      'member': 0.5,
      'recruit': 0.3,
      'associate': 0.2
    }
    return benefits[role.toLowerCase()] || 0.1
  }

  /**
   * Get workplace benefit level
   */
  private getWorkplaceBenefit(type: string | null): number {
    const benefits: Record<string, number> = {
      'guard-post': 0.8,
      'tavern': 0.6,
      'shop': 0.7,
      'mill': 0.5,
      'marina': 0.6,
      'caravan': 0.7
    }
    return benefits[type?.toLowerCase() || ''] || 0.3
  }

  /**
   * Get role weight for different faction roles
   */
  private getRoleWeight(role: string): number {
    const weights: Record<string, number> = {
      'leader': 1.0,
      'officer': 0.8,
      'sergeant': 0.7,
      'member': 0.5,
      'recruit': 0.3,
      'associate': 0.2
    }
    return weights[role.toLowerCase()] || 0.1
  }

  /**
   * Get role pressure level
   */
  private getRolePressure(role: string): number {
    const pressures: Record<string, number> = {
      'leader': 0.9,
      'officer': 0.8,
      'sergeant': 0.7,
      'member': 0.5,
      'recruit': 0.3,
      'associate': 0.2
    }
    return pressures[role.toLowerCase()] || 0.1
  }

  /**
   * Get faction power level
   */
  private getFactionPowerLevel(factionName: string): number {
    const powers: Record<string, number> = {
      'town guard': 0.9,
      'council': 0.8,
      'merchants guild': 0.7,
      'craftsmen': 0.6,
      'farmers': 0.4,
      'refugees': 0.2
    }
    return powers[factionName.toLowerCase()] || 0.3
  }

  /**
   * Save loyalty score to database
   */
  async saveLoyaltyScore(personId: string, targetId: string, result: ScoringResult): Promise<void> {
    await this.prisma.loyaltyScore.upsert({
      where: { 
        personId_targetId: {
          personId,
          targetId
        }
      },
      update: {
        score: result.score,
        window: result.window,
        breakdown: result.breakdown as Record<string, unknown>,
        updatedAt: new Date()
      },
      create: {
        personId,
        targetId,
        score: result.score,
        window: result.window,
        breakdown: result.breakdown as Record<string, unknown>
      }
    })
  }

  /**
   * Get loyalty score for a person to a target
   */
  async getLoyaltyScore(personId: string, targetId: string): Promise<ScoringResult | null> {
    const score = await this.prisma.loyaltyScore.findUnique({
      where: { 
        personId_targetId: {
          personId,
          targetId
        }
      }
    })

    if (!score) return null

    return {
      score: score.score,
      breakdown: score.breakdown as LoyaltyBreakdown,
      window: score.window,
      calculatedAt: score.updatedAt
    }
  }
}
