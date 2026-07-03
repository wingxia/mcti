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
}

export interface ScoredResult {
  top: RankedMob
  alternatives: RankedMob[]
  ranked: RankedMob[]
  vector: TraitVector
  completedCount: number
  confidence: number
}
