/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions } from '../src/data/questions'
import { STORAGE_KEY } from '../src/storage'

const AUTO_ADVANCE_DELAY_MS = 170

const loadApp = async (): Promise<void> => {
  vi.resetModules()
  await import('../src/main')
}

const answerButton = (choice: 'a' | 'b'): HTMLButtonElement => {
  const button = document.querySelector<HTMLButtonElement>(`[data-answer="${choice}"]`)
  if (!button) {
    throw new Error(`Missing answer button ${choice}.`)
  }
  return button
}

const heading = (): string => document.querySelector('h1')?.textContent ?? ''

const progress = (): string => document.querySelector('.progress-copy')?.textContent ?? ''

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

describe('MCTI app flow', () => {
  it('advances after clicking an answer without a next button', async () => {
    await loadApp()

    expect(progress()).toBe('0/93')
    expect(document.querySelector('[data-action="next"]')).toBeNull()

    answerButton('a').click()

    expect(progress()).toBe('1/93')
    expect(heading()).toBe(questions[0].prompt)
    expect(document.querySelector('.choice.is-selected')?.getAttribute('data-answer')).toBe('a')

    await vi.advanceTimersByTimeAsync(AUTO_ADVANCE_DELAY_MS)

    expect(progress()).toBe('1/93')
    expect(heading()).toBe(questions[1].prompt)
  })

  it('opens the result after answering the final question', async () => {
    const seededAnswers = Object.fromEntries(questions.slice(0, -1).map((question) => [question.id, 'a']))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seededAnswers))

    await loadApp()

    expect(progress()).toBe('92/93')
    expect(heading()).toBe(questions.at(-1)?.prompt)

    answerButton('a').click()
    await vi.advanceTimersByTimeAsync(AUTO_ADVANCE_DELAY_MS)

    expect(progress()).toBe('93/93')
    expect(document.querySelector('.result-surface')).not.toBeNull()
    expect(document.querySelector('[data-answer]')).toBeNull()
    expect(location.hash).toMatch(/^#result=/)
  })
})
