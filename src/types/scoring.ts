// Types for Involvement & Loyalty Model v3 Scoring System

export interface InvolvementBreakdown {
  roleActivity: number      // RA - recurring duties (0.0-1.0)
  eventParticipation: number // EP - attendance & initiative (0.0-1.0)
  networkCentrality: number  // NC - graph-based centrality (0.0-1.0)
  initiative: number         // IN - initiated proposals/actions (0.0-1.0)
  reliability: number        // RE - completion rate (0.0-1.0)
}

export interface LoyaltyBreakdown {
  identityFit: number       // IF - kinship/household overlap (0.0-1.0)
  benefitFlow: number       // BF - material/social benefits (0.0-1.0)
  sharedHistory: number     // SH - past cooperation (0.0-1.0)
  pressureCost: number      // PC - penalties if defecting (0.0-1.0)
  satisfaction: number      // SA - sentiment of interactions (0.0-1.0)
}

export interface ScoringWeights {
  involvement: {
    roleActivity: number      // 0.35
    eventParticipation: number // 0.25
    networkCentrality: number  // 0.20
    initiative: number         // 0.10
    reliability: number        // 0.10
  }
  loyalty: {
    identityFit: number       // 0.25
    benefitFlow: number       // 0.25
    sharedHistory: number     // 0.20
    pressureCost: number      // 0.15
    satisfaction: number      // 0.15
  }
}

export interface ScoringWindow {
  days: number
  decayFactor: number // e.g., 0.90 for 10% decay per week
}

export interface ScoringResult {
  score: number
  breakdown: InvolvementBreakdown | LoyaltyBreakdown
  window: string
  calculatedAt: Date
  metadata?: Record<string, any>
}

export interface RoleActivityData {
  personId: string
  roles: Array<{
    role: string
    frequency: number // times per week
    importance: number // 0.0-1.0
    startDate: Date
    endDate?: Date
  }>
}

export interface EventParticipationData {
  personId: string
  events: Array<{
    eventId: string
    eventName: string
    participationLevel: number // 0.0-1.0
    initiativeLevel: number // 0.0-1.0
    date: Date
  }>
}

export interface NetworkCentralityData {
  personId: string
  degree: number
  betweenness: number
  eigenvector: number
  calculatedAt: Date
}

export interface InitiativeData {
  personId: string
  initiatives: Array<{
    type: string
    impact: number // 0.0-1.0
    success: number // 0.0-1.0
    date: Date
  }>
}

export interface ReliabilityData {
  personId: string
  tasks: Array<{
    taskId: string
    assignedDate: Date
    completedDate?: Date
    quality: number // 0.0-1.0
    importance: number // 0.0-1.0
  }>
}

export interface IdentityFitData {
  personId: string
  targetId: string
  kinshipOverlap: number // 0.0-1.0
  householdOverlap: number // 0.0-1.0
  culturalAffinity: number // 0.0-1.0
  ideologicalAlignment: number // 0.0-1.0
}

export interface BenefitFlowData {
  personId: string
  targetId: string
  materialBenefits: number // 0.0-1.0
  socialBenefits: number // 0.0-1.0
  safetyBenefits: number // 0.0-1.0
  opportunityBenefits: number // 0.0-1.0
}

export interface SharedHistoryData {
  personId: string
  targetId: string
  cooperationLength: number // days
  cooperationDepth: number // 0.0-1.0
  eventCoParticipation: number // 0.0-1.0
  conflictHistory: number // 0.0-1.0 (negative)
}

export interface PressureCostData {
  personId: string
  targetId: string
  defectionPenalties: number // 0.0-1.0
  retaliationRisk: number // 0.0-1.0
  socialCost: number // 0.0-1.0
  opportunityCost: number // 0.0-1.0
}

export interface SatisfactionData {
  personId: string
  targetId: string
  recentInteractions: Array<{
    date: Date
    sentiment: number // -1.0 to 1.0
    importance: number // 0.0-1.0
  }>
}

export type ScoringComponent = 
  | 'roleActivity'
  | 'eventParticipation' 
  | 'networkCentrality'
  | 'initiative'
  | 'reliability'
  | 'identityFit'
  | 'benefitFlow'
  | 'sharedHistory'
  | 'pressureCost'
  | 'satisfaction'

export interface ScoringConfig {
  weights: ScoringWeights
  window: ScoringWindow
  enableDecay: boolean
  minScore: number
  maxScore: number
}
