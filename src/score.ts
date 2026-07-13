import type {
  AnswerMap,
  MobProfile,
  PairwiseEvidence,
  Question,
  QuestionOption,
  RankedMob,
  ScoredResult,
  TraitVector,
} from './types'
import { mobProfiles } from './data/mobs'
import { questions as defaultQuestions } from './data/questions'

const EPSILON = 0.0000001
const TARGET_BONUS = 3
export const ITEM_RELIABILITY = 0.75
export const RETEST_CHANGE_RATE = 0.12
const answerPathCache = new WeakMap<MobProfile, WeakMap<readonly Question[], AnswerMap>>()

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
  const cached = answerPathCache.get(target)?.get(sourceQuestions)
  if (cached) {
    return cached
  }

  const answers: AnswerMap = {}
  for (const question of sourceQuestions) {
    const [first, second] = question.options
    answers[question.id] = optionFit(first, target) >= optionFit(second, target) ? 'a' : 'b'
  }
  const profileCache = answerPathCache.get(target) ?? new WeakMap<readonly Question[], AnswerMap>()
  profileCache.set(sourceQuestions, answers)
  answerPathCache.set(target, profileCache)
  return answers
}

const calibratedMatchScore = (rawScore: number, hasAnswers: boolean): number =>
  hasAnswers ? clamp01(0.7 + (rawScore - 0.5) * 0.6) : 0

const sortRanked = (ranked: RankedMob[]): RankedMob[] =>
  ranked.sort((left, right) => {
    const probabilityDelta = right.probability - left.probability
    if (Math.abs(probabilityDelta) > EPSILON) {
      return probabilityDelta
    }
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
        probability: 0,
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

  const candidates = profiles.map((profile) => {
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
      logLikelihood: hasAnswers
        ? matchingAnswers * Math.log(ITEM_RELIABILITY) +
          (completedQuestions.length - matchingAnswers) * Math.log(1 - ITEM_RELIABILITY)
        : 0,
    }
  })

  const maxLogLikelihood = Math.max(...candidates.map((candidate) => candidate.logLikelihood))
  const likelihoods = candidates.map((candidate) => Math.exp(candidate.logLikelihood - maxLogLikelihood))
  const likelihoodTotal = likelihoods.reduce((total, likelihood) => total + likelihood, 0)

  return sortRanked(
    candidates.map(({ logLikelihood: _logLikelihood, ...candidate }, index) => ({
      ...candidate,
      probability: likelihoodTotal > EPSILON ? likelihoods[index] / likelihoodTotal : 0,
    })),
  )
}

const pairwiseEvidence = (
  top: RankedMob,
  runnerUp: RankedMob | undefined,
  answers: AnswerMap,
  sourceQuestions: readonly Question[],
): PairwiseEvidence => {
  if (!runnerUp) {
    return { decisiveCount: 0, topVotes: 0, runnerUpVotes: 0, margin: 0 }
  }

  const topPath = answerPathForMob(top.profile, sourceQuestions)
  const runnerUpPath = answerPathForMob(runnerUp.profile, sourceQuestions)
  let topVotes = 0
  let runnerUpVotes = 0

  for (const question of sourceQuestions) {
    const answer = answers[question.id]
    if (!answer || topPath[question.id] === runnerUpPath[question.id]) {
      continue
    }
    if (answer === topPath[question.id]) {
      topVotes += 1
    } else {
      runnerUpVotes += 1
    }
  }

  return {
    decisiveCount: topVotes + runnerUpVotes,
    topVotes,
    runnerUpVotes,
    margin: topVotes - runnerUpVotes,
  }
}

const retestWinProbability = (evidence: PairwiseEvidence): number => {
  if (evidence.decisiveCount === 0) {
    return 0
  }

  let distribution = [1]
  for (let index = 0; index < evidence.decisiveCount; index += 1) {
    const currentlySupportsTop = index < evidence.topVotes
    const supportsTopAfterRetest = currentlySupportsTop
      ? 1 - RETEST_CHANGE_RATE
      : RETEST_CHANGE_RATE
    const next = Array.from({ length: distribution.length + 1 }, () => 0)
    for (let votes = 0; votes < distribution.length; votes += 1) {
      next[votes] += distribution[votes] * (1 - supportsTopAfterRetest)
      next[votes + 1] += distribution[votes] * supportsTopAfterRetest
    }
    distribution = next
  }

  const halfway = evidence.decisiveCount / 2
  return distribution.reduce((total, probability, topVotes) => {
    if (topVotes > halfway) return total + probability
    if (topVotes === halfway) return total + probability * 0.5
    return total
  }, 0)
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

  if (!top) {
    throw new Error('No mob profiles are available for scoring.')
  }

  const topRunnerUpEvidence = pairwiseEvidence(top, ranked[1], answers, sourceQuestions)
  const retestProbabilities = ranked
    .slice(1, 4)
    .map((alternative) =>
      retestWinProbability(pairwiseEvidence(top, alternative, answers, sourceQuestions)),
    )
  const confidence =
    completedCount > 0 && retestProbabilities.length > 0
      ? Math.min(...retestProbabilities)
      : 0

  return {
    top,
    alternatives: ranked.slice(1, 4),
    ranked,
    vector,
    completedCount,
    confidence,
    topRunnerUpEvidence,
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
