import { describe, expect, it } from 'vitest'
import { clearAnswers, loadAnswers, parseAnswers, saveAnswers, type StorageLike } from '../src/storage'

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
})
