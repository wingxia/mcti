export type TraitVector = Record<string, number>

export type MobCategory = 'friendly' | 'hostile' | 'boss'

export interface WikiSource {
  pageId: number
  revisionId: number
  timestamp: string
  pageUrl: string
}

export interface MobProfile {
  code: string
  name: string
  category: MobCategory
  wikiUrl: string
  behavior: string
  archetype: string
  summary: string
  anchorChoice: string
  traits: TraitVector
  source: WikiSource
  order: number
}

export interface QuestionOption {
  id: 'a' | 'b'
  label: string
  weights: TraitVector
  targetMobCodes: readonly string[]
}

export interface Question {
  id: string
  prompt: string
  options: readonly [QuestionOption, QuestionOption]
}

export type AnswerMap = Record<string, 'a' | 'b'>

export interface RankedMob {
  profile: MobProfile
  score: number
  displayScore: number
  probability: number
}

export interface PairwiseEvidence {
  decisiveCount: number
  topVotes: number
  runnerUpVotes: number
  margin: number
}

export interface ScoredResult {
  top: RankedMob
  alternatives: RankedMob[]
  ranked: RankedMob[]
  vector: TraitVector
  completedCount: number
  confidence: number
  topRunnerUpEvidence: PairwiseEvidence
}

export type AdaptivePhase = 'foundation' | 'adaptive' | 'confirmation' | 'complete'

export type AdaptiveStopReason = 'threshold_met' | 'question_limit' | 'legacy_complete'

export interface AdaptiveConfirmation {
  targetCode: string
  alternativeCodes: string[]
  questionIds: string[]
}

export interface AdaptiveSession {
  version: 2
  answers: AnswerMap
  questionOrder: string[]
  topHistory: string[]
  confirmation: AdaptiveConfirmation | null
  completed: boolean
  stopReason?: AdaptiveStopReason
}

export interface AdaptiveDecision {
  phase: AdaptivePhase
  nextQuestionId?: string
  shouldStop: boolean
  stopReason?: AdaptiveStopReason
  score: ScoredResult
}
