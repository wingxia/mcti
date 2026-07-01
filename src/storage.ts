import type { AnswerMap } from './types'

export const STORAGE_KEY = 'mcti:v1:answers'

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
