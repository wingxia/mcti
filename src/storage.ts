import type { AdaptiveSession, AdaptiveStopReason, AnswerMap } from './types'

export const STORAGE_KEY = 'mcti:v1:answers'
export const SESSION_STORAGE_KEY = 'mcti:v2:session'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const serializeAnswers = (answers: AnswerMap): string => JSON.stringify(answers)

export const parseAnswers = (raw: string | null, validQuestionIds: readonly string[]): AnswerMap => {
  if (!raw) {
    return {}
  }
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    const validIds = new Set(validQuestionIds)
    const answers: AnswerMap = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (validIds.has(key) && (value === 'a' || value === 'b')) {
        answers[key] = value
      }
    }
    return answers
  } catch {
    return {}
  }
}

export const loadAnswers = (
  storage: StorageLike,
  validQuestionIds: readonly string[],
  key = STORAGE_KEY,
): AnswerMap => parseAnswers(storage.getItem(key), validQuestionIds)

export const saveAnswers = (
  storage: StorageLike,
  answers: AnswerMap,
  key = STORAGE_KEY,
): void => {
  storage.setItem(key, serializeAnswers(answers))
}

export const clearAnswers = (storage: StorageLike, key = STORAGE_KEY): void => {
  storage.removeItem(key)
}

const stopReasons = new Set<AdaptiveStopReason>([
  'threshold_met',
  'question_limit',
  'legacy_complete',
])

export const parseAdaptiveSession = (
  raw: string | null,
  validQuestionIds: readonly string[],
): AdaptiveSession | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object' || parsed.version !== 2) {
      return null
    }

    const validIds = new Set(validQuestionIds)
    const answers = parseAnswers(JSON.stringify(parsed.answers ?? {}), validQuestionIds)
    const rawOrder = Array.isArray(parsed.questionOrder) ? parsed.questionOrder : []
    const questionOrder = rawOrder.filter(
      (value, index, values): value is string =>
        typeof value === 'string' && validIds.has(value) && values.indexOf(value) === index,
    )
    const topHistory = Array.isArray(parsed.topHistory)
      ? parsed.topHistory.filter((value): value is string => typeof value === 'string')
      : []
    const rawConfirmation = parsed.confirmation
    const confirmation =
      rawConfirmation && typeof rawConfirmation === 'object'
        ? (() => {
            const candidate = rawConfirmation as Record<string, unknown>
            if (typeof candidate.targetCode !== 'string') return null
            const alternativeCodes = Array.isArray(candidate.alternativeCodes)
              ? candidate.alternativeCodes.filter(
                  (value): value is string => typeof value === 'string',
                )
              : []
            const questionIds = Array.isArray(candidate.questionIds)
              ? candidate.questionIds.filter(
                  (value): value is string => typeof value === 'string' && validIds.has(value),
                )
              : []
            return { targetCode: candidate.targetCode, alternativeCodes, questionIds }
          })()
        : null
    const stopReason =
      typeof parsed.stopReason === 'string' &&
      stopReasons.has(parsed.stopReason as AdaptiveStopReason)
        ? (parsed.stopReason as AdaptiveStopReason)
        : undefined

    return {
      version: 2,
      answers,
      questionOrder,
      topHistory: topHistory.slice(0, questionOrder.length),
      confirmation,
      completed: parsed.completed === true,
      stopReason,
    }
  } catch {
    return null
  }
}

export const loadAdaptiveSession = (
  storage: StorageLike,
  validQuestionIds: readonly string[],
  key = SESSION_STORAGE_KEY,
): AdaptiveSession | null => parseAdaptiveSession(storage.getItem(key), validQuestionIds)

export const saveAdaptiveSession = (
  storage: StorageLike,
  session: AdaptiveSession,
  key = SESSION_STORAGE_KEY,
): void => {
  storage.setItem(key, JSON.stringify(session))
}

export const clearAdaptiveSession = (storage: StorageLike): void => {
  storage.removeItem(SESSION_STORAGE_KEY)
  storage.removeItem(STORAGE_KEY)
}
