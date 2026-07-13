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

  it('keeps complete ideal answer paths separated and well calibrated', () => {
    const voteGaps = mobProfiles.map((profile) => {
      const result = scoreAnswers(answerPathForMob(profile))
      const voteGap = Math.round((result.top.score - result.alternatives[0].score) * questions.length)

      expect(result.top.profile.code).toBe(profile.code)
      expect(result.top.score).toBe(1)
      expect(result.top.displayScore).toBe(1)
      expect(result.confidence).toBeGreaterThanOrEqual(0.95)
      expect(voteGap).toBeGreaterThanOrEqual(8)

      return voteGap
    })

    expect(median(voteGaps)).toBeGreaterThanOrEqual(15)
  })

  it('keeps every pair of mob answer signatures at least eight answers apart', () => {
    const signatures = mobProfiles.map((profile) => ({
      code: profile.code,
      answers: answerPathForMob(profile),
    }))
    let minimumDistance = Number.POSITIVE_INFINITY

    for (let left = 0; left < signatures.length; left += 1) {
      for (let right = left + 1; right < signatures.length; right += 1) {
        const distance = questions.reduce(
          (total, question) =>
            total +
            Number(
              signatures[left].answers[question.id] !== signatures[right].answers[question.id],
            ),
          0,
        )
        minimumDistance = Math.min(minimumDistance, distance)
      }
    }

    expect(minimumDistance).toBeGreaterThanOrEqual(8)
  })

  it('references every result in at least one visible behavior choice', () => {
    const referencedCodes = new Set(
      questions.flatMap((question) => question.options.flatMap((option) => option.targetMobCodes)),
    )
    const missingCodes = mobProfiles
      .map((profile) => profile.code)
      .filter((code) => !referencedCodes.has(code))

    expect(missingCodes).toEqual([])
  })
})
