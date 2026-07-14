import { describe, expect, it } from 'vitest'
import { mobProfiles } from '../src/data/mobs'
import { questions } from '../src/data/questions'
import { answerPathForMob, cosineSimilarity, scoreAnswers } from '../src/score'

describe('MCTI scoring', () => {
  it('locks the result count and keeps a Step-II-depth adaptive question pool', () => {
    expect(mobProfiles).toHaveLength(89)
    expect(questions).toHaveLength(143)
    expect(questions.filter((question) => question.tier === 'core')).toHaveLength(92)
    expect(questions.filter((question) => question.tier === 'facet')).toHaveLength(51)
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length)
  })

  it('uses deterministic ordering for an empty vector', () => {
    const result = scoreAnswers({})

    expect(result.top.profile.code).toBe('Allay')
    expect(result.top.score).toBe(0)
    expect(result.top.displayScore).toBe(0)
    expect(result.top.probability).toBeCloseTo(1 / mobProfiles.length)
    expect(result.confidence).toBe(0)
  })

  it('matches a targeted answer path to the target mob', () => {
    const target = mobProfiles.find((profile) => profile.code === 'Warden')

    expect(target).toBeDefined()
    const result = scoreAnswers(answerPathForMob(target!))

    expect(result.top.profile.code).toBe('Warden')
    expect(result.top.score).toBeGreaterThan(result.alternatives[0].score)
    expect(result.top.displayScore).toBeGreaterThanOrEqual(0.95)
    expect(result.confidence).toBeGreaterThanOrEqual(0.85)
  })

  it('calculates cosine similarity from weighted vectors', () => {
    expect(cosineSimilarity({ caution: 1, stealth: 1 }, { caution: 1, stealth: 1 })).toBeCloseTo(1)
    expect(cosineSimilarity({ caution: 1 }, { mobility: 1 })).toBe(0)
  })
})
