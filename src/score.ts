import type { AnswerMap, MobProfile, Question, QuestionOption, RankedMob, ScoredResult, TraitVector } from './types'
import { mobProfiles } from './data/mobs'
import { questions } from './data/questions'

const EPSILON = 0.0000001

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
  sourceQuestions: readonly Question[] = questions,
): TraitVector =>
  sourceQuestions.reduce<TraitVector>((vector, question) => {
    const answer = answers[question.id]
    const selected = question.options.find((candidate) => candidate.id === answer)
    return selected ? addVectors(vector, selected.weights) : vector
  }, {})

export const rankMobs = (
  vector: TraitVector,
  profiles: readonly MobProfile[] = mobProfiles,
): RankedMob[] =>
  profiles
    .map((profile) => ({
      profile,
      score: cosineSimilarity(vector, profile.traits),
    }))
    .sort((left, right) => {
      const scoreDelta = right.score - left.score
      if (Math.abs(scoreDelta) > EPSILON) {
        return scoreDelta
      }
      return left.profile.order - right.profile.order
    })

export const scoreAnswers = (
  answers: AnswerMap,
  sourceQuestions: readonly Question[] = questions,
  profiles: readonly MobProfile[] = mobProfiles,
): ScoredResult => {
  const vector = vectorFromAnswers(answers, sourceQuestions)
  const ranked = rankMobs(vector, profiles)
  const completedCount = sourceQuestions.filter((question) => answers[question.id]).length
  const top = ranked[0]
  const runnerUp = ranked[1]
  const confidence = top && runnerUp ? Math.max(0, Math.min(1, top.score - runnerUp.score + 0.35)) : 0

  if (!top) {
    throw new Error('No mob profiles are available for scoring.')
  }

  return {
    top,
    alternatives: ranked.slice(1, 4),
    ranked,
    vector,
    completedCount,
    confidence,
  }
}

const optionDot = (option: QuestionOption, profile: MobProfile): number =>
  dotProduct(option.weights, profile.traits)

export const answerPathForMob = (
  target: MobProfile,
  sourceQuestions: readonly Question[] = questions,
): AnswerMap => {
  const answers: AnswerMap = {}
  for (const question of sourceQuestions) {
    const [first, second] = question.options
    answers[question.id] = optionDot(first, target) >= optionDot(second, target) ? 'a' : 'b'
  }
  return answers
}

export const coverageReport = (
  profiles: readonly MobProfile[] = mobProfiles,
  sourceQuestions: readonly Question[] = questions,
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
    }
  })
