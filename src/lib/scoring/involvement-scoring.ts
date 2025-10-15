// Involvement Scoring Service for v3 Model
import { PrismaClient } from '@prisma/client'
import type {
  InvolvementBreakdown,
  ScoringResult,
  ScoringConfig
} from '@/types/scoring'

export class InvolvementScoringService {
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
        days: 90,
        decayFactor: 0.90
      },
      enableDecay: true,
      minScore: 0.0,
      maxScore: 1.0,
      ...config
    }
  }

  /**
   * Calculate involvement score for a person
   * Formula: I = 0.35*RA + 0.25*EP + 0.20*NC + 0.10*IN + 0.10*RE
   */
  async calculateInvolvementScore(personId: string): Promise<ScoringResult> {
    const breakdown: InvolvementBreakdown = {
      roleActivity: await this.calculateRoleActivity(personId),
      eventParticipation: await this.calculateEventParticipation(personId),
      networkCentrality: await this.calculateNetworkCentrality(personId),
      initiative: await this.calculateInitiative(personId),
      reliability: await this.calculateReliability(personId)
    }

    const score = this.calculateWeightedScore(breakdown)
    const clampedScore = this.clampScore(score)

    return {
      score: clampedScore,
      breakdown,
      window: `${this.config.window.days}d`,
      calculatedAt: new Date(),
      metadata: {
        weights: this.config.weights.involvement,
        decayEnabled: this.config.enableDecay
      }
    }
  }

  /**
   * Calculate Role Activity (RA) component
   * Based on recurring duties like guard shifts, shopkeeping, town watch, council
   */
  private async calculateRoleActivity(personId: string): Promise<number> {
    // Get person's current roles and responsibilities
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
      include: {
        memberships: {
          include: { faction: true }
        },
        worksAt: true,
        workplace: true
      }
    })

    if (!person) return 0.0

    let roleActivity = 0.0
    const now = new Date()
    const windowStart = new Date(now.getTime() - this.config.window.days * 24 * 60 * 60 * 1000)

    // Factor 1: Faction membership roles
    for (const membership of person.memberships) {
      if (membership.leftAt && membership.leftAt < windowStart) continue
      
      const roleWeight = this.getRoleWeight(membership.role)
      const timeWeight = this.calculateTimeWeight(membership.joinedAt, membership.leftAt, now)
      roleActivity += roleWeight * timeWeight
    }

    // Factor 2: Workplace responsibilities
    if (person.workplace) {
      const workplaceWeight = this.getWorkplaceWeight(person.workplace.type)
      roleActivity += workplaceWeight * 0.5 // Assume 50% time commitment
    }

    // Factor 3: Occupation-based activity
    if (person.occupation) {
      const occupationWeight = this.getOccupationWeight(person.occupation)
      roleActivity += occupationWeight * 0.3 // Assume 30% civic involvement
    }

    return this.clampScore(roleActivity)
  }

  /**
   * Calculate Event Participation (EP) component
   * Based on attendance and initiative in recent events
   */
  private async calculateEventParticipation(personId: string): Promise<number> {
    const now = new Date()
    const windowStart = new Date(now.getTime() - this.config.window.days * 24 * 60 * 60 * 1000)

    // Get events from the new v3 events table
    const events = await this.prisma.eventV3.findMany({
      where: {
        startsAt: {
          gte: windowStart,
          lte: now
        }
      }
    })

    // Get person's event participation (this would need to be tracked)
    // For now, we'll use a simplified calculation based on faction activity
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
      include: {
        memberships: {
          include: { faction: true }
        }
      }
    })

    if (!person) return 0.0

    let participation = 0.0
    const totalEvents = events.length

    if (totalEvents === 0) return 0.0

    // Simplified: assume participation based on faction activity
    for (const membership of person.memberships) {
      if (membership.leftAt && membership.leftAt < windowStart) continue
      
      const factionActivity = this.getFactionActivityLevel(membership.faction.name)
      participation += factionActivity * 0.5 // 50% participation rate
    }

    // Normalize by total events
    participation = Math.min(participation / totalEvents, 1.0)

    return this.clampScore(participation)
  }

  /**
   * Calculate Network Centrality (NC) component
   * Based on graph-based centrality metrics
   */
  private async calculateNetworkCentrality(personId: string): Promise<number> {
    // Get person's relationships
    const relationships = await this.prisma.relationship.findMany({
      where: {
        OR: [
          { srcId: personId },
          { dstId: personId }
        ]
      }
    })

    if (relationships.length === 0) return 0.0

    // Calculate degree centrality (simplified)
    const degree = relationships.length
    const maxPossibleDegree = 100 // Assume max 100 relationships for normalization
    
    const degreeCentrality = Math.min(degree / maxPossibleDegree, 1.0)

    // For now, use degree centrality as a proxy for all centrality measures
    // In a full implementation, you'd calculate betweenness and eigenvector centrality
    return this.clampScore(degreeCentrality)
  }

  /**
   * Calculate Initiative (IN) component
   * Based on number and impact of initiated proposals/actions
   */
  private async calculateInitiative(personId: string): Promise<number> {
    // This would typically come from event logs or action tracking
    // For now, we'll use a simplified calculation based on faction leadership roles
    
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
      include: {
        memberships: {
          include: { faction: true }
        }
      }
    })

    if (!person) return 0.0

    let initiative = 0.0

    for (const membership of person.memberships) {
      const roleWeight = this.getInitiativeWeight(membership.role)
      initiative += roleWeight
    }

    return this.clampScore(initiative)
  }

  /**
   * Calculate Reliability (RE) component
   * Based on completion rate for assigned tasks
   */
  private async calculateReliability(personId: string): Promise<number> {
    // This would typically come from task completion tracking
    // For now, we'll use a simplified calculation based on faction membership duration
    
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
      include: {
        memberships: true
      }
    })

    if (!person) return 0.0

    let reliability = 0.5 // Base reliability

    // Factor in membership stability
    for (const membership of person.memberships) {
      if (!membership.leftAt) {
        // Still active member - positive reliability
        const duration = Date.now() - membership.joinedAt.getTime()
        const durationDays = duration / (1000 * 60 * 60 * 24)
        const stabilityBonus = Math.min(durationDays / 365, 1.0) * 0.3 // Up to 30% bonus
        reliability += stabilityBonus
      }
    }

    return this.clampScore(reliability)
  }

  /**
   * Calculate weighted score from breakdown
   */
  private calculateWeightedScore(breakdown: InvolvementBreakdown): number {
    const weights = this.config.weights.involvement
    return (
      breakdown.roleActivity * weights.roleActivity +
      breakdown.eventParticipation * weights.eventParticipation +
      breakdown.networkCentrality * weights.networkCentrality +
      breakdown.initiative * weights.initiative +
      breakdown.reliability * weights.reliability
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
   * Get role weight for different faction roles
   */
  private getRoleWeight(role: string): number {
    const roleWeights: Record<string, number> = {
      'leader': 1.0,
      'officer': 0.8,
      'sergeant': 0.7,
      'member': 0.5,
      'recruit': 0.3,
      'associate': 0.2
    }
    return roleWeights[role.toLowerCase()] || 0.1
  }

  /**
   * Get workplace weight for different types
   */
  private getWorkplaceWeight(type: string | null): number {
    const workplaceWeights: Record<string, number> = {
      'guard-post': 0.9,
      'tavern': 0.6,
      'shop': 0.5,
      'mill': 0.4,
      'marina': 0.5,
      'caravan': 0.7
    }
    return workplaceWeights[type?.toLowerCase() || ''] || 0.3
  }

  /**
   * Get occupation weight for different occupations
   */
  private getOccupationWeight(occupation: string): number {
    const occupationWeights: Record<string, number> = {
      'guard': 0.9,
      'soldier': 0.8,
      'merchant': 0.6,
      'artisan': 0.5,
      'farmer': 0.4,
      'laborer': 0.3,
      'noble': 0.7,
      'scholar': 0.6
    }
    return occupationWeights[occupation.toLowerCase()] || 0.3
  }

  /**
   * Get faction activity level
   */
  private getFactionActivityLevel(factionName: string): number {
    const factionActivity: Record<string, number> = {
      'town guard': 0.9,
      'council': 0.8,
      'merchants guild': 0.6,
      'craftsmen': 0.5,
      'farmers': 0.4,
      'refugees': 0.2
    }
    return factionActivity[factionName.toLowerCase()] || 0.3
  }

  /**
   * Get initiative weight for different roles
   */
  private getInitiativeWeight(role: string): number {
    const initiativeWeights: Record<string, number> = {
      'leader': 0.9,
      'officer': 0.7,
      'sergeant': 0.5,
      'member': 0.3,
      'recruit': 0.1,
      'associate': 0.1
    }
    return initiativeWeights[role.toLowerCase()] || 0.1
  }

  /**
   * Save involvement score to database
   */
  async saveInvolvementScore(personId: string, result: ScoringResult): Promise<void> {
    await this.prisma.involvementScore.upsert({
      where: { personId },
      update: {
        score: result.score,
        window: result.window,
        breakdown: result.breakdown as Record<string, unknown>,
        updatedAt: new Date()
      },
      create: {
        personId,
        score: result.score,
        window: result.window,
        breakdown: result.breakdown as Record<string, unknown>
      }
    })
  }

  /**
   * Get involvement score for a person
   */
  async getInvolvementScore(personId: string): Promise<ScoringResult | null> {
    const score = await this.prisma.involvementScore.findUnique({
      where: { personId }
    })

    if (!score) return null

    return {
      score: score.score,
      breakdown: score.breakdown as InvolvementBreakdown,
      window: score.window,
      calculatedAt: score.updatedAt
    }
  }
}
