import { describe, expect, it } from 'vitest'
import { mobProfiles } from '../src/data/mobs'
import { questions } from '../src/data/questions'
import { answerPathForMob, coverageReport, dotProduct, scoreAnswers } from '../src/score'
import type { AnswerMap, TraitVector } from '../src/types'

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)]
}

const percentile = (values: readonly number[], ratio: number): number => {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor((sorted.length - 1) * ratio)]
}

describe('result coverage', () => {
  it('can return every current mob as a primary result', () => {
    const report = coverageReport()
    const failed = report.filter((entry) => !entry.passed)

    expect(report).toHaveLength(mobProfiles.length)
    expect(failed).toEqual([])
  })

  it('keeps ideal answer paths separated and well calibrated', () => {
    const voteGaps = mobProfiles.map((profile) => {
      const result = scoreAnswers(answerPathForMob(profile))
      const voteGap = Math.round((result.top.score - result.alternatives[0].score) * questions.length)

      expect(result.top.profile.code).toBe(profile.code)
      expect(result.top.score).toBe(1)
      expect(result.top.displayScore).toBe(1)
      expect(result.confidence).toBeGreaterThanOrEqual(0.85)
      expect(voteGap).toBeGreaterThanOrEqual(1)

      return voteGap
    })

    expect(median(voteGaps)).toBeGreaterThanOrEqual(10)
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

  it('references every result in at least one visible behavior choice', () => {
    const referencedCodes = new Set(
      questions.flatMap((question) => question.options.flatMap((option) => option.targetMobCodes)),
    )
    const missingCodes = mobProfiles
      .map((profile) => profile.code)
      .filter((code) => !referencedCodes.has(code))

    expect(missingCodes).toEqual([])
  })

  it('keeps coherent ordinary answer paths strongly matched', () => {
    let seed = 42
    const random = (): number => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    }
    const normal = (): number =>
      Math.sqrt(-2 * Math.log(Math.max(random(), Number.EPSILON))) * Math.cos(2 * Math.PI * random())
    const traitKeys = [
      ...new Set(questions.flatMap((question) => question.options.flatMap((option) => Object.keys(option.weights)))),
    ]
    const displayScores: number[] = []
    const confidenceScores: number[] = []

    for (let sample = 0; sample < 300; sample += 1) {
      const persona: TraitVector = Object.fromEntries(
        traitKeys.map((key) => [key, Math.max(0, normal() + 0.7)]),
      )
      const answers: AnswerMap = Object.fromEntries(
        questions.map((question) => {
          const [first, second] = question.options
          const firstFit = dotProduct(first.weights, persona) + normal() * 0.08
          const secondFit = dotProduct(second.weights, persona) + normal() * 0.08
          return [question.id, firstFit >= secondFit ? 'a' : 'b']
        }),
      )
      const result = scoreAnswers(answers)
      displayScores.push(result.top.displayScore)
      confidenceScores.push(result.confidence)
    }

    expect(percentile(displayScores, 0.1)).toBeGreaterThanOrEqual(0.8)
    expect(median(displayScores)).toBeGreaterThanOrEqual(0.84)
    expect(percentile(confidenceScores, 0.1)).toBeGreaterThanOrEqual(0.55)
    expect(median(confidenceScores)).toBeGreaterThanOrEqual(0.75)
  })

  it('does not collapse complete extreme answer paths to low percentages', () => {
    const paths: AnswerMap[] = [
      Object.fromEntries(questions.map((question) => [question.id, 'a'])),
      Object.fromEntries(questions.map((question) => [question.id, 'b'])),
      Object.fromEntries(questions.map((question, index) => [question.id, index % 2 === 0 ? 'a' : 'b'])),
    ]

    for (const answers of paths) {
      const result = scoreAnswers(answers)
      expect(result.top.displayScore).toBeGreaterThanOrEqual(0.75)
      expect(result.confidence).toBeGreaterThanOrEqual(0.6)
    }
  })
})
