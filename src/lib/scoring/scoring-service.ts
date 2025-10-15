// Main Scoring Service for Involvement & Loyalty Model v3
import { PrismaClient } from '@prisma/client'
import { InvolvementScoringService } from './involvement-scoring'
import { LoyaltyScoringService } from './loyalty-scoring'
import type { ScoringConfig, ScoringResult } from '@/types/scoring'

export class ScoringService {
  private prisma: PrismaClient
  private involvementService: InvolvementScoringService
  private loyaltyService: LoyaltyScoringService
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

    this.involvementService = new InvolvementScoringService(prisma, this.config)
    this.loyaltyService = new LoyaltyScoringService(prisma, this.config)
  }

  /**
   * Calculate and save involvement score for a person
   */
  async calculateAndSaveInvolvementScore(personId: string): Promise<ScoringResult> {
    const result = await this.involvementService.calculateInvolvementScore(personId)
    await this.involvementService.saveInvolvementScore(personId, result)
    return result
  }

  /**
   * Calculate and save loyalty score for a person to a target
   */
  async calculateAndSaveLoyaltyScore(personId: string, targetId: string): Promise<ScoringResult> {
    const result = await this.loyaltyService.calculateLoyaltyScore(personId, targetId)
    await this.loyaltyService.saveLoyaltyScore(personId, targetId, result)
    return result
  }

  /**
   * Recalculate all scores for a person
   */
  async recalculatePersonScores(personId: string): Promise<{
    involvement: ScoringResult
    loyalties: ScoringResult[]
  }> {
    // Calculate involvement score
    const involvement = await this.calculateAndSaveInvolvementScore(personId)

    // Get all potential targets (factions and people)
    const factions = await this.prisma.faction.findMany()
    const people = await this.prisma.person.findMany({
      where: { id: { not: personId } }
    })

    // Calculate loyalty scores for all targets
    const loyalties: ScoringResult[] = []

    // Loyalty to factions
    for (const faction of factions) {
      const loyalty = await this.calculateAndSaveLoyaltyScore(personId, faction.id)
      loyalties.push(loyalty)
    }

    // Loyalty to other people (limit to avoid performance issues)
    const limitedPeople = people.slice(0, 10) // Limit to first 10 people
    for (const person of limitedPeople) {
      const loyalty = await this.calculateAndSaveLoyaltyScore(personId, person.id)
      loyalties.push(loyalty)
    }

    return { involvement, loyalties }
  }

  /**
   * Recalculate all scores for all people
   */
  async recalculateAllScores(): Promise<{
    totalPeople: number
    processedPeople: number
    errors: string[]
  }> {
    const people = await this.prisma.person.findMany()
    const errors: string[] = []
    let processedPeople = 0

    for (const person of people) {
      try {
        await this.recalculatePersonScores(person.id)
        processedPeople++
      } catch (error) {
        errors.push(`Failed to process person ${person.id}: ${error}`)
      }
    }

    return {
      totalPeople: people.length,
      processedPeople,
      errors
    }
  }

  /**
   * Get involvement score for a person
   */
  async getInvolvementScore(personId: string): Promise<ScoringResult | null> {
    return await this.involvementService.getInvolvementScore(personId)
  }

  /**
   * Get loyalty score for a person to a target
   */
  async getLoyaltyScore(personId: string, targetId: string): Promise<ScoringResult | null> {
    return await this.loyaltyService.getLoyaltyScore(personId, targetId)
  }

  /**
   * Get all loyalty scores for a person
   */
  async getAllLoyaltyScores(personId: string): Promise<ScoringResult[]> {
    const scores = await this.prisma.loyaltyScore.findMany({
      where: { personId }
    })

    return scores.map(score => ({
      score: score.score,
      breakdown: score.breakdown as any,
      window: score.window,
      calculatedAt: score.updatedAt,
      metadata: { targetId: score.targetId }
    }))
  }

  /**
   * Get top loyalty targets for a person
   */
  async getTopLoyaltyTargets(personId: string, limit: number = 5): Promise<Array<{
    targetId: string
    targetName: string
    targetType: 'faction' | 'person'
    score: number
    breakdown: any
  }>> {
    const scores = await this.prisma.loyaltyScore.findMany({
      where: { personId },
      orderBy: { score: 'desc' },
      take: limit
    })

    const results = []

    for (const score of scores) {
      // Check if target is a faction
      const faction = await this.prisma.faction.findUnique({
        where: { id: score.targetId }
      })

      if (faction) {
        results.push({
          targetId: score.targetId,
          targetName: faction.name,
          targetType: 'faction' as const,
          score: score.score,
          breakdown: score.breakdown
        })
      } else {
        // Check if target is a person
        const person = await this.prisma.person.findUnique({
          where: { id: score.targetId }
        })

        if (person) {
          results.push({
            targetId: score.targetId,
            targetName: person.name,
            targetType: 'person' as const,
            score: score.score,
            breakdown: score.breakdown
          })
        }
      }
    }

    return results
  }

  /**
   * Get scoring statistics
   */
  async getScoringStatistics(): Promise<{
    totalPeople: number
    peopleWithInvolvementScores: number
    peopleWithLoyaltyScores: number
    averageInvolvementScore: number
    averageLoyaltyScore: number
    scoreDistribution: {
      involvement: Record<string, number>
      loyalty: Record<string, number>
    }
  }> {
    const totalPeople = await this.prisma.person.count()
    const peopleWithInvolvementScores = await this.prisma.involvementScore.count()
    const peopleWithLoyaltyScores = await this.prisma.loyaltyScore.count()

    // Calculate average scores
    const involvementScores = await this.prisma.involvementScore.findMany({
      select: { score: true }
    })
    const loyaltyScores = await this.prisma.loyaltyScore.findMany({
      select: { score: true }
    })

    const averageInvolvementScore = involvementScores.length > 0
      ? involvementScores.reduce((sum, s) => sum + s.score, 0) / involvementScores.length
      : 0

    const averageLoyaltyScore = loyaltyScores.length > 0
      ? loyaltyScores.reduce((sum, s) => sum + s.score, 0) / loyaltyScores.length
      : 0

    // Calculate score distribution
    const involvementDistribution = this.calculateScoreDistribution(involvementScores.map(s => s.score))
    const loyaltyDistribution = this.calculateScoreDistribution(loyaltyScores.map(s => s.score))

    return {
      totalPeople,
      peopleWithInvolvementScores,
      peopleWithLoyaltyScores,
      averageInvolvementScore,
      averageLoyaltyScore,
      scoreDistribution: {
        involvement: involvementDistribution,
        loyalty: loyaltyDistribution
      }
    }
  }

  /**
   * Calculate score distribution by ranges
   */
  private calculateScoreDistribution(scores: number[]): Record<string, number> {
    const distribution = {
      '0.0-0.2': 0,
      '0.2-0.4': 0,
      '0.4-0.6': 0,
      '0.6-0.8': 0,
      '0.8-1.0': 0
    }

    for (const score of scores) {
      if (score >= 0.0 && score < 0.2) distribution['0.0-0.2']++
      else if (score >= 0.2 && score < 0.4) distribution['0.2-0.4']++
      else if (score >= 0.4 && score < 0.6) distribution['0.4-0.6']++
      else if (score >= 0.6 && score < 0.8) distribution['0.6-0.8']++
      else if (score >= 0.8 && score <= 1.0) distribution['0.8-1.0']++
    }

    return distribution
  }

  /**
   * Update scoring configuration
   */
  updateConfig(newConfig: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.involvementService = new InvolvementScoringService(this.prisma, this.config)
    this.loyaltyService = new LoyaltyScoringService(this.prisma, this.config)
  }

  /**
   * Get current configuration
   */
  getConfig(): ScoringConfig {
    return { ...this.config }
  }
}
