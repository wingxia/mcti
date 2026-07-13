import { mobProfiles } from './data/mobs'
import { questions } from './data/questions'
import { answerPathForMob, ITEM_RELIABILITY, scoreAnswers } from './score'
import type {
  AdaptiveDecision,
  AdaptiveSession,
  AnswerMap,
  Question,
  RankedMob,
  ScoredResult,
} from './types'

export const MIN_ADAPTIVE_QUESTIONS = 20
export const TYPICAL_ADAPTIVE_QUESTIONS = 60
export const MAX_ADAPTIVE_QUESTIONS = 93
export const MATCH_THRESHOLD = 0.85
export const CONFIDENCE_THRESHOLD = 0.85
export const STABLE_TOP_STEPS = 3
export const CONFIRMATION_QUESTIONS = 6
export const REQUIRED_CONFIRMATION_SUPPORT = 5

const EPSILON = 0.0000001
const questionById = new Map(questions.map((question) => [question.id, question]))
const profileByCode = new Map(mobProfiles.map((profile) => [profile.code, profile]))
const answerPaths = new Map(
  mobProfiles.map((profile) => [profile.code, answerPathForMob(profile, questions)]),
)

const expectedAnswer = (profileCode: string, questionId: string): 'a' | 'b' => {
  const answer = answerPaths.get(profileCode)?.[questionId]
  if (!answer) {
    throw new Error(`Missing ideal answer for ${profileCode} on ${questionId}.`)
  }
  return answer
}

const binaryEntropy = (probability: number): number => {
  if (probability <= EPSILON || probability >= 1 - EPSILON) {
    return 0
  }
  return -probability * Math.log2(probability) - (1 - probability) * Math.log2(1 - probability)
}

const expectedInformationGain = (question: Question, ranked: readonly RankedMob[]): number => {
  const responseAProbability = ranked.reduce(
    (total, candidate) =>
      total +
      candidate.probability *
        (expectedAnswer(candidate.profile.code, question.id) === 'a'
          ? ITEM_RELIABILITY
          : 1 - ITEM_RELIABILITY),
    0,
  )
  return binaryEntropy(responseAProbability) - binaryEntropy(ITEM_RELIABILITY)
}

const traitKeys = (question: Question): Set<string> =>
  new Set(question.options.flatMap((option) => Object.keys(option.weights)))

const recentTraitOverlap = (question: Question, questionOrder: readonly string[]): number => {
  const recentKeys = new Set(
    questionOrder
      .slice(-2)
      .flatMap((questionId) => {
        const recent = questionById.get(questionId)
        return recent ? [...traitKeys(recent)] : []
      }),
  )
  return [...traitKeys(question)].filter((key) => recentKeys.has(key)).length
}

const distinguishesCandidates = (
  question: Question,
  targetCode: string,
  alternativeCodes: readonly string[],
): boolean =>
  alternativeCodes.some(
    (alternativeCode) =>
      expectedAnswer(targetCode, question.id) !== expectedAnswer(alternativeCode, question.id),
  )

const selectQuestion = (
  session: AdaptiveSession,
  score: ScoredResult,
  targetCode?: string,
  alternativeCodes: readonly string[] = [],
): Question | undefined => {
  const answeredIds = new Set(Object.keys(session.answers))
  const available = questions.filter((question) => !answeredIds.has(question.id))
  if (available.length === 0) {
    return undefined
  }

  const discriminators = targetCode
    ? available.filter((question) => distinguishesCandidates(question, targetCode, alternativeCodes))
    : []
  const candidates = discriminators.length > 0 ? discriminators : available
  const scored = candidates.map((question) => ({
    question,
    gain: expectedInformationGain(question, score.ranked),
    overlap: recentTraitOverlap(question, session.questionOrder),
    order: questions.indexOf(question),
  }))
  const bestGain = Math.max(...scored.map((candidate) => candidate.gain))
  const nearBest = scored.filter(
    (candidate) => candidate.gain >= bestGain - Math.max(EPSILON, Math.abs(bestGain) * 0.02),
  )

  return nearBest.sort(
    (left, right) => left.overlap - right.overlap || left.order - right.order,
  )[0]?.question
}

const orderedAnswers = (session: AdaptiveSession, count = session.questionOrder.length): AnswerMap =>
  Object.fromEntries(
    session.questionOrder
      .slice(0, count)
      .flatMap((questionId) => {
        const answer = session.answers[questionId]
        return answer ? [[questionId, answer] as const] : []
      }),
  )

const rebuildTopHistory = (session: AdaptiveSession): string[] => {
  const history: string[] = []
  const prefixAnswers: AnswerMap = {}
  for (const questionId of session.questionOrder) {
    const answer = session.answers[questionId]
    if (!answer) break
    prefixAnswers[questionId] = answer
    history.push(scoreAnswers(prefixAnswers).top.profile.code)
  }
  return history
}

const topIsStable = (session: AdaptiveSession, topCode: string): boolean =>
  session.topHistory.length >= STABLE_TOP_STEPS &&
  session.topHistory.slice(-STABLE_TOP_STEPS).every((code) => code === topCode)

const requiredMatchThreshold = (completedCount: number): number =>
  completedCount < TYPICAL_ADAPTIVE_QUESTIONS ? 0.9 : MATCH_THRESHOLD

const meetsPreliminaryThreshold = (session: AdaptiveSession, score: ScoredResult): boolean =>
  score.completedCount >= MIN_ADAPTIVE_QUESTIONS &&
  score.top.displayScore >= requiredMatchThreshold(score.completedCount) &&
  score.confidence >= CONFIDENCE_THRESHOLD &&
  topIsStable(session, score.top.profile.code) &&
  score.topRunnerUpEvidence.decisiveCount >= 3 &&
  score.topRunnerUpEvidence.margin >= 2

const appendQuestion = (session: AdaptiveSession, question: Question): AdaptiveSession => ({
  ...session,
  questionOrder: [...session.questionOrder, question.id],
})

const finishSession = (
  session: AdaptiveSession,
  stopReason: NonNullable<AdaptiveSession['stopReason']>,
): AdaptiveSession => ({
  ...session,
  completed: true,
  stopReason,
})

const advanceSession = (source: AdaptiveSession): AdaptiveSession => {
  let session = source
  const score = scoreAnswers(session.answers)

  if (session.confirmation) {
    const targetCode = session.confirmation.targetCode
    const metricsHeld =
      score.top.profile.code === targetCode &&
      score.top.displayScore >= requiredMatchThreshold(score.completedCount) &&
      score.confidence >= CONFIDENCE_THRESHOLD

    if (!metricsHeld) {
      session = { ...session, confirmation: null }
    } else {
      const answeredConfirmationIds = session.confirmation.questionIds.filter(
        (questionId) => session.answers[questionId],
      )
      if (answeredConfirmationIds.length >= CONFIRMATION_QUESTIONS) {
        const support = answeredConfirmationIds.reduce(
          (total, questionId) =>
            total + Number(session.answers[questionId] === expectedAnswer(targetCode, questionId)),
          0,
        )
        if (
          support >= REQUIRED_CONFIRMATION_SUPPORT &&
          meetsPreliminaryThreshold(session, score)
        ) {
          return finishSession(session, 'threshold_met')
        }
        session = { ...session, confirmation: null }
      } else {
        const next = selectQuestion(
          session,
          score,
          targetCode,
          session.confirmation.alternativeCodes,
        )
        if (next) {
          return appendQuestion(
            {
              ...session,
              confirmation: {
                ...session.confirmation,
                questionIds: [...session.confirmation.questionIds, next.id],
              },
            },
            next,
          )
        }
        session = { ...session, confirmation: null }
      }
    }
  }

  if (score.completedCount >= MAX_ADAPTIVE_QUESTIONS) {
    return finishSession(session, 'question_limit')
  }

  if (meetsPreliminaryThreshold(session, score)) {
    const confirmation = {
      targetCode: score.top.profile.code,
      alternativeCodes: score.alternatives.map((candidate) => candidate.profile.code),
      questionIds: [] as string[],
    }
    const next = selectQuestion(
      { ...session, confirmation },
      score,
      confirmation.targetCode,
      confirmation.alternativeCodes,
    )
    if (next) {
      return appendQuestion(
        {
          ...session,
          confirmation: { ...confirmation, questionIds: [next.id] },
        },
        next,
      )
    }
  }

  const needsCandidateDiscrimination =
    score.completedCount >= MIN_ADAPTIVE_QUESTIONS &&
    (score.confidence < CONFIDENCE_THRESHOLD ||
      score.topRunnerUpEvidence.decisiveCount < 3 ||
      score.topRunnerUpEvidence.margin < 2)
  const next = selectQuestion(
    session,
    score,
    needsCandidateDiscrimination ? score.top.profile.code : undefined,
    needsCandidateDiscrimination
      ? score.alternatives.map((candidate) => candidate.profile.code)
      : [],
  )
  return next ? appendQuestion(session, next) : finishSession(session, 'question_limit')
}

export const createAdaptiveSession = (): AdaptiveSession =>
  advanceSession({
    version: 2,
    answers: {},
    questionOrder: [],
    topHistory: [],
    confirmation: null,
    completed: false,
  })

export const restoreAdaptiveSession = (source: AdaptiveSession): AdaptiveSession => {
  const validIds = new Set(questions.map((question) => question.id))
  const questionOrder = source.questionOrder.filter(
    (questionId, index, values) => validIds.has(questionId) && values.indexOf(questionId) === index,
  )
  const answers = Object.fromEntries(
    Object.entries(source.answers).filter(
      ([questionId, answer]) =>
        validIds.has(questionId) && (answer === 'a' || answer === 'b'),
    ),
  ) as AnswerMap
  const confirmation =
    source.confirmation && profileByCode.has(source.confirmation.targetCode)
      ? {
          targetCode: source.confirmation.targetCode,
          alternativeCodes: source.confirmation.alternativeCodes.filter((code) =>
            profileByCode.has(code),
          ),
          questionIds: source.confirmation.questionIds.filter((questionId) =>
            validIds.has(questionId),
          ),
        }
      : null
  const normalized: AdaptiveSession = {
    ...source,
    version: 2,
    answers,
    questionOrder,
    topHistory: [],
    confirmation,
  }
  if (normalized.completed || questionOrder.some((questionId) => !answers[questionId])) {
    return { ...normalized, topHistory: rebuildTopHistory(normalized) }
  }
  return advanceSession(normalized)
}

export const sessionFromLegacyAnswers = (
  answers: AnswerMap,
  legacyComplete: boolean,
): AdaptiveSession => {
  const questionOrder = questions
    .map((question) => question.id)
    .filter((questionId) => answers[questionId])
  const session: AdaptiveSession = {
    version: 2,
    answers: orderedAnswers({
      version: 2,
      answers,
      questionOrder,
      topHistory: [],
      confirmation: null,
      completed: false,
    }),
    questionOrder,
    topHistory: [],
    confirmation: null,
    completed: legacyComplete,
    stopReason: legacyComplete ? 'legacy_complete' : undefined,
  }
  return legacyComplete
    ? { ...session, topHistory: rebuildTopHistory(session) }
    : restoreAdaptiveSession(session)
}

export const answerAdaptiveQuestion = (
  source: AdaptiveSession,
  questionId: string,
  answer: 'a' | 'b',
): AdaptiveSession => {
  const index = source.questionOrder.indexOf(questionId)
  if (index === -1) {
    throw new Error(`Question ${questionId} is not part of this adaptive session.`)
  }

  const changed = source.answers[questionId] !== undefined && source.answers[questionId] !== answer
  const mustTruncate = changed && index < source.questionOrder.length - 1
  const questionOrder = mustTruncate
    ? source.questionOrder.slice(0, index + 1)
    : source.questionOrder
  const retainedIds = new Set(questionOrder)
  const answers = Object.fromEntries(
    Object.entries(source.answers).filter(([id]) => retainedIds.has(id)),
  ) as AnswerMap
  answers[questionId] = answer

  const session: AdaptiveSession = {
    ...source,
    answers,
    questionOrder,
    confirmation: mustTruncate ? null : source.confirmation,
    completed: false,
    stopReason: undefined,
    topHistory: [],
  }

  session.topHistory =
    !mustTruncate && source.answers[questionId] === undefined && index === questionOrder.length - 1
      ? [...source.topHistory, scoreAnswers(answers).top.profile.code]
      : rebuildTopHistory(session)

  if (!mustTruncate && index < questionOrder.length - 1) {
    return session
  }
  return advanceSession(session)
}

export const evaluateAdaptiveSession = (session: AdaptiveSession): AdaptiveDecision => {
  const score = scoreAnswers(session.answers)
  const nextQuestionId = session.questionOrder.find((questionId) => !session.answers[questionId])
  const phase = session.completed
    ? 'complete'
    : session.confirmation
      ? 'confirmation'
      : score.completedCount < MIN_ADAPTIVE_QUESTIONS
        ? 'foundation'
        : 'adaptive'

  return {
    phase,
    nextQuestionId,
    shouldStop: session.completed,
    stopReason: session.stopReason,
    score,
  }
}

export const idealAnswerFor = (profileCode: string, questionId: string): 'a' | 'b' => {
  if (!profileByCode.has(profileCode) || !questionById.has(questionId)) {
    throw new Error(`Unknown adaptive signature entry ${profileCode}/${questionId}.`)
  }
  return expectedAnswer(profileCode, questionId)
}
