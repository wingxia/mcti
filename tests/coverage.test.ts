import { describe, expect, it } from 'vitest'
import { mobProfiles } from '../src/data/mobs'
import { questions } from '../src/data/questions'
import { answerPathForMob, coverageReport, scoreAnswers } from '../src/score'

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)]
}

describe('result coverage', () => {
  it('keeps every visible question focused on situations instead of mob roles', () => {
    const roleMechanismTerms = [
      '喷墨',
      '风弹',
      '驯服',
      '狼铠',
      '挖掘疲劳',
      '末地水晶',
      '凋灵之首',
      '龙息',
      '毒箭',
      '虚弱之箭',
      '缓慢之箭',
      '刷怪笼',
      '瞬移',
      '火球',
    ]
    const mobNames = [...mobProfiles]
      .map((profile) => profile.name)
      .sort((left, right) => right.length - left.length)
    const violations = questions.flatMap((question) =>
      [question.prompt, ...question.options.map((option) => option.label)].flatMap((text) => {
        const terms = ['像', ...roleMechanismTerms, ...mobNames].filter((term) =>
          text.includes(term),
        )
        return terms.length > 0 ? [{ questionId: question.id, text, terms }] : []
      }),
    )

    expect(violations).toEqual([])
  })

  it('keeps scenario copy concise and non-duplicated', () => {
    const longPrompts = questions.filter((question) => Array.from(question.prompt).length > 32)
    const longOptions = questions.flatMap((question) =>
      question.options.filter((option) => Array.from(option.label).length > 42),
    )
    const prompts = questions.map((question) => question.prompt)
    const optionPairs = questions.map((question) =>
      question.options.map((option) => option.label).join('\n'),
    )

    expect(longPrompts).toEqual([])
    expect(longOptions).toEqual([])
    expect(new Set(prompts).size).toBe(prompts.length)
    expect(new Set(optionPairs).size).toBe(optionPairs.length)
  })

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

  it('keeps explicit hidden targets valid and covers every result', () => {
    const knownCodes = new Set(mobProfiles.map((profile) => profile.code))
    const referencedCodes = new Set(
      questions.flatMap((question) => question.options.flatMap((option) => option.targetMobCodes)),
    )
    const unknownCodes = [...referencedCodes].filter((code) => !knownCodes.has(code))
    const missingCodes = mobProfiles
      .map((profile) => profile.code)
      .filter((code) => !referencedCodes.has(code))

    expect(unknownCodes).toEqual([])
    expect(missingCodes).toEqual([])
  })
})
