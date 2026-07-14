/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  answerAdaptiveQuestion,
  createAdaptiveSession,
  evaluateAdaptiveSession,
  idealAnswerFor,
} from '../src/adaptive'
import { questions } from '../src/data/questions'
import { SESSION_STORAGE_KEY, STORAGE_KEY } from '../src/storage'
import type { AdaptiveSession } from '../src/types'

const AUTO_ADVANCE_DELAY_MS = 170
const questionById = new Map(questions.map((question) => [question.id, question]))

const loadApp = async (): Promise<void> => {
  vi.resetModules()
  await import('../src/main')
}

const answerButton = (choice: 'a' | 'b'): HTMLButtonElement => {
  const button = document.querySelector<HTMLButtonElement>(`[data-answer="${choice}"]`)
  if (!button) throw new Error(`Missing answer button ${choice}.`)
  return button
}

const heading = (): string => document.querySelector('h1')?.textContent ?? ''
const progress = (): string => document.querySelector('.progress-copy')?.textContent ?? ''
const storedSession = (): AdaptiveSession =>
  JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null') as AdaptiveSession

const installLocalStorage = (): void => {
  const store = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      clear: () => store.clear(),
      getItem: (key: string) => store.get(key) ?? null,
      removeItem: (key: string) => {
        store.delete(key)
      },
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
    },
  })
}

const sessionBeforeIdealCompletion = (targetCode: string): AdaptiveSession => {
  let session = createAdaptiveSession()
  while (!session.completed) {
    const questionId = evaluateAdaptiveSession(session).nextQuestionId
    if (!questionId) throw new Error('Missing ideal completion question.')
    const next = answerAdaptiveQuestion(session, questionId, idealAnswerFor(targetCode, questionId))
    if (next.completed) return session
    session = next
  }
  throw new Error('Could not create a session immediately before completion.')
}

beforeEach(() => {
  vi.useFakeTimers()
  document.body.innerHTML = '<div id="app"></div>'
  installLocalStorage()
  window.localStorage.clear()
  history.replaceState(null, '', '/')
})

afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
  window.localStorage.clear()
  document.body.innerHTML = ''
})

describe('MCTI adaptive app flow', () => {
  it('starts at the adaptive minimum and advances to the selected next question', async () => {
    await loadApp()

    const initial = storedSession()
    expect(progress()).toBe('0/20 · 建立轮廓')
    expect(heading()).toBe(questionById.get(initial.questionOrder[0])?.prompt)
    expect(document.querySelector('[data-action="next"]')).toBeNull()

    answerButton('a').click()
    expect(progress()).toBe('1/20 · 建立轮廓')
    expect(document.querySelector('.choice.is-selected')?.getAttribute('data-answer')).toBe('a')

    await vi.advanceTimersByTimeAsync(AUTO_ADVANCE_DELAY_MS)
    const advanced = storedSession()
    expect(heading()).toBe(questionById.get(advanced.questionOrder[1])?.prompt)
    expect(new Set(advanced.questionOrder).size).toBe(advanced.questionOrder.length)
  })

  it('opens the result automatically when the final confirmation answer succeeds', async () => {
    const seeded = sessionBeforeIdealCompletion('Warden')
    const finalQuestionId = seeded.questionOrder.find((questionId) => !seeded.answers[questionId])
    if (!finalQuestionId) throw new Error('Missing final seeded question.')
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(seeded))

    await loadApp()

    expect(progress()).toContain('正在确认')
    expect(heading()).toBe(questionById.get(finalQuestionId)?.prompt)

    answerButton(idealAnswerFor('Warden', finalQuestionId)).click()
    await vi.advanceTimersByTimeAsync(AUTO_ADVANCE_DELAY_MS)

    expect(progress()).toBe('共完成 26 题')
    expect(document.querySelector('.result-surface')).not.toBeNull()
    expect(document.querySelector('[data-answer]')).toBeNull()
    expect(location.hash).toBe('#result=Warden')
  })

  it('truncates later answers when an earlier response changes', async () => {
    let seeded = createAdaptiveSession()
    for (let index = 0; index < 10; index += 1) {
      const questionId = evaluateAdaptiveSession(seeded).nextQuestionId
      if (!questionId) throw new Error('Missing seeded adaptive question.')
      seeded = answerAdaptiveQuestion(seeded, questionId, idealAnswerFor('Allay', questionId))
    }
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(seeded))

    await loadApp()
    for (let step = 0; step < 4; step += 1) {
      document.querySelector<HTMLButtonElement>('[data-action="back"]')?.click()
    }

    const beforeChange = storedSession()
    const editedQuestionId = beforeChange.questionOrder[6]
    const oldAnswer = beforeChange.answers[editedQuestionId]
    answerButton(oldAnswer === 'a' ? 'b' : 'a').click()

    const afterChange = storedSession()
    expect(Object.keys(afterChange.answers)).toHaveLength(7)
    expect(afterChange.questionOrder).toHaveLength(8)
    expect(afterChange.confirmation).toBeNull()
  })

  it('migrates a complete legacy 93-question answer map directly to a result', async () => {
    const legacyAnswers = Object.fromEntries(
      questions.slice(0, 93).map((question) => [question.id, 'a']),
    )
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyAnswers))

    await loadApp()

    expect(progress()).toBe('共完成 93 题')
    expect(document.querySelector('.result-surface')).not.toBeNull()
    expect(storedSession().stopReason).toBe('legacy_complete')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('continues an old low-confidence 93-question session in deepening mode', async () => {
    const questionOrder = questions.slice(0, 93).map((question) => question.id)
    const answers = Object.fromEntries(questionOrder.map((questionId) => [questionId, 'a']))
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        answers,
        questionOrder,
        topHistory: [],
        confirmation: null,
        completed: true,
        stopReason: 'question_limit',
      } satisfies AdaptiveSession),
    )

    await loadApp()

    const restored = storedSession()
    const nextQuestionId = restored.questionOrder.find((questionId) => !restored.answers[questionId])
    expect(progress()).toBe('93 题 · 深入辨析')
    expect(restored.completed).toBe(false)
    expect(questionById.get(nextQuestionId ?? '')?.tier).toBe('facet')
    expect(heading()).toBe(questionById.get(nextQuestionId ?? '')?.prompt)
  })
})
