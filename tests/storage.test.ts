import { describe, expect, it } from 'vitest'
import {
  clearAdaptiveSession,
  clearAnswers,
  loadAdaptiveSession,
  loadAnswers,
  parseAdaptiveSession,
  parseAnswers,
  saveAdaptiveSession,
  saveAnswers,
  SESSION_STORAGE_KEY,
  STORAGE_KEY,
  type StorageLike,
} from '../src/storage'
import type { AdaptiveSession } from '../src/types'

const createStorage = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    removeItem: (key) => {
      data.delete(key)
    },
  }
}

describe('answer storage', () => {
  it('saves and loads valid answers', () => {
    const storage = createStorage()

    saveAnswers(storage, { one: 'a', two: 'b' }, 'test-key')

    expect(loadAnswers(storage, ['one', 'two'], 'test-key')).toEqual({ one: 'a', two: 'b' })
  })

  it('drops malformed, stale, and invalid answers', () => {
    const raw = JSON.stringify({ one: 'a', two: 'x', stale: 'b' })

    expect(parseAnswers(raw, ['one', 'two'])).toEqual({ one: 'a' })
    expect(parseAnswers('{not-json', ['one'])).toEqual({})
  })

  it('clears saved answers', () => {
    const storage = createStorage()

    saveAnswers(storage, { one: 'a' }, 'test-key')
    clearAnswers(storage, 'test-key')

    expect(loadAnswers(storage, ['one'], 'test-key')).toEqual({})
  })

  it('saves and validates a version two adaptive session', () => {
    const storage = createStorage()
    const session: AdaptiveSession = {
      version: 2,
      answers: { one: 'a' },
      questionOrder: ['one', 'two'],
      topHistory: ['Allay'],
      confirmation: {
        targetCode: 'Allay',
        alternativeCodes: ['Bat'],
        questionIds: ['two'],
      },
      completed: false,
    }

    saveAdaptiveSession(storage, session)

    expect(loadAdaptiveSession(storage, ['one', 'two'])).toEqual(session)
  })

  it('drops invalid adaptive session fields and rejects malformed payloads', () => {
    const raw = JSON.stringify({
      version: 2,
      answers: { one: 'a', two: 'x', stale: 'b' },
      questionOrder: ['one', 'one', 'stale', 'two'],
      topHistory: ['Allay', 3],
      confirmation: { targetCode: 'Allay', alternativeCodes: ['Bat', 2], questionIds: ['two', 'stale'] },
      completed: false,
    })

    expect(parseAdaptiveSession(raw, ['one', 'two'])).toMatchObject({
      answers: { one: 'a' },
      questionOrder: ['one', 'two'],
      topHistory: ['Allay'],
      confirmation: { targetCode: 'Allay', alternativeCodes: ['Bat'], questionIds: ['two'] },
    })
    expect(parseAdaptiveSession('{bad-json', ['one'])).toBeNull()
    expect(parseAdaptiveSession(JSON.stringify({ version: 1 }), ['one'])).toBeNull()
  })

  it('clears both current and legacy session keys', () => {
    const storage = createStorage()
    storage.setItem(SESSION_STORAGE_KEY, '{}')
    storage.setItem(STORAGE_KEY, '{}')

    clearAdaptiveSession(storage)

    expect(storage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
  })
})
