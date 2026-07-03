import type { AnswerMap, MobProfile, Question, QuestionOption, RankedMob, ScoredResult, TraitVector } from './types'
import { mobProfiles } from './data/mobs'
import { questions as defaultQuestions } from './data/questions'

const EPSILON = 0.0000001

type RawRankedMob = Omit<RankedMob, 'displayScore'>

type CalibrationEntry = {
  idealScore: number
  idealGap: number
}

let defaultCalibration: Map<string, CalibrationEntry> | undefined

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

const rankRawMobs = (
  vector: TraitVector,
  profiles: readonly MobProfile[] = mobProfiles,
): RawRankedMob[] =>
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

const optionDot = (option: QuestionOption, profile: MobProfile): number =>
  dotProduct(option.weights, profile.traits)

export const answerPathForMob = (
  target: MobProfile,
  sourceQuestions: readonly Question[] = defaultQuestions,
): AnswerMap => {
  const answers: AnswerMap = {}
  for (const question of sourceQuestions) {
    const [first, second] = question.options
    answers[question.id] = optionDot(first, target) >= optionDot(second, target) ? 'a' : 'b'
  }
  return answers
}

const buildCalibration = (
  profiles: readonly MobProfile[],
  sourceQuestions: readonly Question[],
): Map<string, CalibrationEntry> => {
  const calibration = new Map<string, CalibrationEntry>()

  for (const profile of profiles) {
    const vector = vectorFromAnswers(answerPathForMob(profile, sourceQuestions), sourceQuestions)
    const ranked = rankRawMobs(vector, profiles)
    const ideal = ranked.find((candidate) => candidate.profile.code === profile.code)
    const runnerUp = ranked.find((candidate) => candidate.profile.code !== profile.code)

    calibration.set(profile.code, {
      idealScore: Math.max(EPSILON, ideal?.score ?? EPSILON),
      idealGap: Math.max(EPSILON, (ideal?.score ?? 0) - (runnerUp?.score ?? 0)),
    })
  }

  return calibration
}

const calibrationFor = (
  profiles: readonly MobProfile[],
  sourceQuestions: readonly Question[],
): Map<string, CalibrationEntry> => {
  if (profiles === mobProfiles && sourceQuestions === defaultQuestions) {
    defaultCalibration ??= buildCalibration(profiles, sourceQuestions)
    return defaultCalibration
  }

  return buildCalibration(profiles, sourceQuestions)
}

const withDisplayScores = (
  ranked: readonly RawRankedMob[],
  calibration: Map<string, CalibrationEntry>,
  hasSignal: boolean,
): RankedMob[] =>
  ranked.map((candidate) => {
    const entry = calibration.get(candidate.profile.code)
    return {
      ...candidate,
      displayScore: hasSignal && entry ? clamp01(candidate.score / entry.idealScore) : 0,
    }
  })

export const rankMobs = (
  vector: TraitVector,
  profiles: readonly MobProfile[] = mobProfiles,
  sourceQuestions: readonly Question[] = defaultQuestions,
): RankedMob[] =>
  withDisplayScores(
    rankRawMobs(vector, profiles),
    calibrationFor(profiles, sourceQuestions),
    vectorLength(vector) >= EPSILON,
  )

export const scoreAnswers = (
  answers: AnswerMap,
  sourceQuestions: readonly Question[] = defaultQuestions,
  profiles: readonly MobProfile[] = mobProfiles,
): ScoredResult => {
  const vector = vectorFromAnswers(answers, sourceQuestions)
  const rawRanked = rankRawMobs(vector, profiles)
  const hasSignal = vectorLength(vector) >= EPSILON
  const calibration = calibrationFor(profiles, sourceQuestions)
  const ranked = withDisplayScores(rawRanked, calibration, hasSignal)
  const completedCount = sourceQuestions.filter((question) => answers[question.id]).length
  const top = ranked[0]
  const runnerUp = ranked[1]

  if (!top) {
    throw new Error('No mob profiles are available for scoring.')
  }

  const topCalibration = calibration.get(top.profile.code)
  const rawGap = runnerUp ? top.score - runnerUp.score : 0
  const confidence = hasSignal && topCalibration ? clamp01(rawGap / topCalibration.idealGap) : 0

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
