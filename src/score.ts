import type { AnswerMap, MobProfile, Question, QuestionOption, RankedMob, ScoredResult, TraitVector } from './types'
import { mobProfiles } from './data/mobs'
import { questions as defaultQuestions } from './data/questions'

const EPSILON = 0.0000001
const TARGET_BONUS = 3

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))

export const addVectors = (left: TraitVector, right: TraitVector): TraitVector => {
  const next: TraitVector = { ...left }
  for (const [key, value] of Object.entries(right)) {
    next[key] = (next[key] ?? 0) + value
  }
  return next
}

export const dotProduct = (left: TraitVector, right: TraitVector): number => {
  let total = 0
  for (const [key, value] of Object.entries(left)) {
    total += value * (right[key] ?? 0)
  }
  return total
}

export const vectorLength = (vector: TraitVector): number =>
  Math.sqrt(Object.values(vector).reduce((total, value) => total + value * value, 0))

export const cosineSimilarity = (left: TraitVector, right: TraitVector): number => {
  const leftLength = vectorLength(left)
  const rightLength = vectorLength(right)
  if (leftLength < EPSILON || rightLength < EPSILON) {
    return 0
  }
  return dotProduct(left, right) / (leftLength * rightLength)
}

export const vectorFromAnswers = (
  answers: AnswerMap,
  sourceQuestions: readonly Question[] = defaultQuestions,
): TraitVector =>
  sourceQuestions.reduce<TraitVector>((vector, question) => {
    const answer = answers[question.id]
    const selected = question.options.find((candidate) => candidate.id === answer)
    return selected ? addVectors(vector, selected.weights) : vector
  }, {})

const optionFit = (option: QuestionOption, profile: MobProfile): number =>
  dotProduct(option.weights, profile.traits) +
  (option.targetMobCodes.includes(profile.code) ? TARGET_BONUS : 0)

export const answerPathForMob = (
  target: MobProfile,
  sourceQuestions: readonly Question[] = defaultQuestions,
): AnswerMap => {
  const answers: AnswerMap = {}
  for (const question of sourceQuestions) {
    const [first, second] = question.options
    answers[question.id] = optionFit(first, target) >= optionFit(second, target) ? 'a' : 'b'
  }
  return answers
}

const calibratedMatchScore = (rawScore: number, hasAnswers: boolean): number =>
  hasAnswers ? clamp01(0.7 + (rawScore - 0.5) * 0.6) : 0

const sortRanked = (ranked: RankedMob[]): RankedMob[] =>
  ranked.sort((left, right) => {
    const scoreDelta = right.score - left.score
    if (Math.abs(scoreDelta) > EPSILON) {
      return scoreDelta
    }
    return left.profile.order - right.profile.order
  })

export const rankMobs = (
  vector: TraitVector,
  profiles: readonly MobProfile[] = mobProfiles,
): RankedMob[] => {
  const hasSignal = vectorLength(vector) >= EPSILON
  return sortRanked(
    profiles.map((profile) => {
      const score = cosineSimilarity(vector, profile.traits)
      return {
        profile,
        score,
        displayScore: hasSignal ? clamp01(score) : 0,
      }
    }),
  )
}

const rankAnswerAgreement = (
  answers: AnswerMap,
  sourceQuestions: readonly Question[],
  profiles: readonly MobProfile[],
): RankedMob[] => {
  const completedQuestions = sourceQuestions.filter((question) => answers[question.id])
  const hasAnswers = completedQuestions.length > 0

  return sortRanked(
    profiles.map((profile) => {
      const expected = answerPathForMob(profile, sourceQuestions)
      const matchingAnswers = completedQuestions.reduce(
        (total, question) => total + Number(answers[question.id] === expected[question.id]),
        0,
      )
      const score = hasAnswers ? matchingAnswers / completedQuestions.length : 0
      return {
        profile,
        score,
        displayScore: calibratedMatchScore(score, hasAnswers),
      }
    }),
  )
}

export const scoreAnswers = (
  answers: AnswerMap,
  sourceQuestions: readonly Question[] = defaultQuestions,
  profiles: readonly MobProfile[] = mobProfiles,
): ScoredResult => {
  const vector = vectorFromAnswers(answers, sourceQuestions)
  const ranked = rankAnswerAgreement(answers, sourceQuestions, profiles)
  const completedCount = sourceQuestions.filter((question) => answers[question.id]).length
  const top = ranked[0]
  const runnerUp = ranked[1]

  if (!top) {
    throw new Error('No mob profiles are available for scoring.')
  }

  const completion = sourceQuestions.length > 0 ? completedCount / sourceQuestions.length : 0
  const coherence = clamp01((top.score - 0.5) / 0.5)
  const voteGap = runnerUp ? Math.max(0, (top.score - runnerUp.score) * completedCount) : 0
  const marginStrength = Math.tanh(voteGap * 0.55)
  const confidence =
    completedCount > 0 ? clamp01(completion * (0.45 + 0.3 * coherence + 0.25 * marginStrength)) : 0

  return {
    top,
    alternatives: ranked.slice(1, 4),
    ranked,
    vector,
    completedCount,
    confidence,
  }
}

export const coverageReport = (
  profiles: readonly MobProfile[] = mobProfiles,
  sourceQuestions: readonly Question[] = defaultQuestions,
) =>
  profiles.map((profile) => {
    const result = scoreAnswers(answerPathForMob(profile, sourceQuestions), sourceQuestions, profiles)
    return {
      code: profile.code,
      expected: profile.name,
      actual: result.top.profile.name,
      actualCode: result.top.profile.code,
      passed: result.top.profile.code === profile.code,
      score: result.top.score,
      displayScore: result.top.displayScore,
      confidence: result.confidence,
    }
  })
