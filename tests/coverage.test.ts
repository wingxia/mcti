import { describe, expect, it } from 'vitest'
import { mobProfiles } from '../src/data/mobs'
import { questions } from '../src/data/questions'
import { answerPathForMob, coverageReport, scoreAnswers } from '../src/score'

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)]
}

describe('result coverage', () => {
  it('can return every current mob as a primary result', () => {
    const report = coverageReport()
    const failed = report.filter((entry) => !entry.passed)

    expect(report).toHaveLength(mobProfiles.length)
    expect(failed).toEqual([])
  })

  it('keeps ideal answer paths separated and well calibrated', () => {
    const gaps = mobProfiles.map((profile) => {
      const result = scoreAnswers(answerPathForMob(profile))
      const rawGap = result.top.score - result.alternatives[0].score

      expect(result.top.profile.code).toBe(profile.code)
      expect(result.top.displayScore).toBeGreaterThanOrEqual(0.95)
      expect(result.confidence).toBeGreaterThanOrEqual(0.85)
      expect(rawGap).toBeGreaterThanOrEqual(0.05)

      return rawGap
    })

    expect(median(gaps)).toBeGreaterThanOrEqual(0.08)
  })

  it('gives every mob a distinct ideal answer signature', () => {
    const signatures = new Map<string, string[]>()

    for (const profile of mobProfiles) {
      const path = answerPathForMob(profile)
      const signature = questions.map((question) => path[question.id]).join('')
      signatures.set(signature, [...(signatures.get(signature) ?? []), profile.code])
    }

    const duplicates = [...signatures.values()].filter((codes) => codes.length > 1)
    expect(duplicates).toEqual([])
  })
})
