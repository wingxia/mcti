import { describe, expect, it } from 'vitest'
import { mobProfiles } from '../src/data/mobs'
import { coverageReport } from '../src/score'

describe('result coverage', () => {
  it('can return every current mob as a primary result', () => {
    const report = coverageReport()
    const failed = report.filter((entry) => !entry.passed)

    expect(report).toHaveLength(mobProfiles.length)
    expect(failed).toEqual([])
  })
})
