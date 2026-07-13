import { describe, expect, it } from 'vitest'
import {
  answerAdaptiveQuestion,
  CONFIRMATION_QUESTIONS,
  createAdaptiveSession,
  evaluateAdaptiveSession,
  idealAnswerFor,
  MAX_ADAPTIVE_QUESTIONS,
  MIN_ADAPTIVE_QUESTIONS,
} from '../src/adaptive'
import { mobProfiles } from '../src/data/mobs'
import type { AdaptiveSession } from '../src/types'

const percentile = (values: readonly number[], ratio: number): number => {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor((sorted.length - 1) * ratio)]
}

const completePath = (
  targetCode: string,
  answerFor: (ideal: 'a' | 'b') => 'a' | 'b' = (ideal) => ideal,
): AdaptiveSession => {
  let session = createAdaptiveSession()
  while (!session.completed) {
    const questionId = evaluateAdaptiveSession(session).nextQuestionId
    if (!questionId) throw new Error(`Missing next question for ${targetCode}.`)
    session = answerAdaptiveQuestion(
      session,
      questionId,
      answerFor(idealAnswerFor(targetCode, questionId)),
    )
  }
  return session
}

describe('adaptive assessment', () => {
  it('returns every ideal mob path efficiently after confirmation', () => {
    const lengths = mobProfiles.map((profile) => {
      const session = completePath(profile.code)
      const decision = evaluateAdaptiveSession(session)

      expect(decision.score.top.profile.code).toBe(profile.code)
      expect(decision.stopReason).toBe('threshold_met')
      expect(decision.score.completedCount).toBeGreaterThanOrEqual(MIN_ADAPTIVE_QUESTIONS)
      return decision.score.completedCount
    })

    expect(percentile(lengths, 0.5)).toBeLessThanOrEqual(28)
    expect(Math.max(...lengths)).toBeLessThanOrEqual(45)
  })

  it('stays accurate and efficient with ten percent response changes', () => {
    let seed = 20260713
    const random = (): number => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    }
    const results: Array<{ correct: boolean; length: number }> = []

    for (let repeat = 0; repeat < 2; repeat += 1) {
      for (const profile of mobProfiles) {
        const session = completePath(profile.code, (ideal) =>
          random() < 0.9 ? ideal : ideal === 'a' ? 'b' : 'a',
        )
        const decision = evaluateAdaptiveSession(session)
        results.push({
          correct: decision.score.top.profile.code === profile.code,
          length: decision.score.completedCount,
        })
      }
    }

    expect(results.filter((result) => result.correct).length / results.length).toBeGreaterThanOrEqual(0.95)
    expect(percentile(results.map((result) => result.length), 0.5)).toBeLessThanOrEqual(40)
    expect(percentile(results.map((result) => result.length), 0.9)).toBeLessThanOrEqual(60)
  }, 15_000)

  it('does not award early high confidence to random answer paths', () => {
    let seed = 77
    const random = (): number => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    }
    const stopReasons: Array<AdaptiveSession['stopReason']> = []

    for (let sample = 0; sample < 60; sample += 1) {
      let session = createAdaptiveSession()
      while (!session.completed) {
        const questionId = evaluateAdaptiveSession(session).nextQuestionId
        if (!questionId) throw new Error('Random path did not receive a next question.')
        session = answerAdaptiveQuestion(session, questionId, random() < 0.5 ? 'a' : 'b')
      }
      stopReasons.push(session.stopReason)
      if (session.stopReason === 'question_limit') {
        expect(evaluateAdaptiveSession(session).score.completedCount).toBe(MAX_ADAPTIVE_QUESTIONS)
      }
    }

    const earlyHighRate = stopReasons.filter((reason) => reason === 'threshold_met').length / stopReasons.length
    expect(earlyHighRate).toBeLessThanOrEqual(0.05)
  }, 15_000)

  it('selects deterministically without repeating questions', () => {
    const run = (): string[] => {
      let session = createAdaptiveSession()
      while (!session.completed && session.questionOrder.length < 35) {
        const questionId = evaluateAdaptiveSession(session).nextQuestionId
        if (!questionId) break
        session = answerAdaptiveQuestion(session, questionId, 'a')
      }
      return session.questionOrder
    }

    const first = run()
    const second = run()
    expect(first).toEqual(second)
    expect(new Set(first).size).toBe(first.length)
  })

  it('resets confirmation after contradictory answers lower its metrics', () => {
    const targetCode = 'Warden'
    let session = createAdaptiveSession()
    while (!session.confirmation) {
      const questionId = evaluateAdaptiveSession(session).nextQuestionId
      if (!questionId) throw new Error('Target path did not enter confirmation.')
      session = answerAdaptiveQuestion(session, questionId, idealAnswerFor(targetCode, questionId))
    }

    const firstConfirmation = session.confirmation
    expect(firstConfirmation.questionIds).toHaveLength(1)
    let answeredConfirmation = 0
    while (session.confirmation?.targetCode === firstConfirmation.targetCode) {
      const questionId = evaluateAdaptiveSession(session).nextQuestionId
      if (!questionId) break
      const ideal = idealAnswerFor(targetCode, questionId)
      session = answerAdaptiveQuestion(session, questionId, ideal === 'a' ? 'b' : 'a')
      answeredConfirmation += 1
      if (answeredConfirmation > CONFIRMATION_QUESTIONS) break
    }

    expect(session.confirmation?.targetCode).not.toBe(firstConfirmation.targetCode)
    expect(session.completed).toBe(false)
  })
})
