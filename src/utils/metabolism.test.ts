import { describe, expect, it } from 'vitest'
import type { UserProfile, WeightRecord } from '../types'
import { calculateBMR, calculateMetabolismStats } from './metabolism'

describe('calculateBMR', () => {
  it('should return null if age is missing', () => {
    expect(calculateBMR('male', 70, 175)).toBeNull()
  })

  it('should calculate BMR correctly for male', () => {
    // Male, 70kg, 175cm, 30 years old
    // 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75 -> 1649
    expect(calculateBMR('male', 70, 175, 30)).toBe(1649)
  })

  it('should calculate BMR correctly for female', () => {
    // Female, 60kg, 165cm, 25 years old
    // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345
    expect(calculateBMR('female', 60, 165, 25)).toBe(1345)
  })
})

describe('calculateMetabolismStats', () => {
  const profile: UserProfile = {
    gender: 'male',
    height: 175,
    age: 30,
    initialWeight: 75,
    createdAt: '2023-01-01T00:00:00Z',
  }

  it('should return insufficient data if less than minDays', () => {
    const records: WeightRecord[] = [
      { id: '1', date: '2023-01-01', weight: 75, bmi: 24, createdAt: '' },
      { id: '2', date: '2023-01-04', weight: 74, bmi: 24, createdAt: '' },
    ]
    const result = calculateMetabolismStats(profile, records, 7)
    expect(result.isDataSufficient).toBe(false)
    expect(result.trendDays).toBe(4) // 01-01 to 01-04 is 4 days inclusive
  })

  it('should calculate trend correctly for a steady loss', () => {
    // Losing 0.1kg per day
    const records: WeightRecord[] = [
      { id: '1', date: '2023-01-01', weight: 75.0, bmi: 24, createdAt: '' },
      { id: '2', date: '2023-01-02', weight: 74.9, bmi: 24, createdAt: '' },
      { id: '3', date: '2023-01-03', weight: 74.8, bmi: 24, createdAt: '' },
      { id: '4', date: '2023-01-04', weight: 74.7, bmi: 24, createdAt: '' },
      { id: '5', date: '2023-01-05', weight: 74.6, bmi: 24, createdAt: '' },
      { id: '6', date: '2023-01-06', weight: 74.5, bmi: 24, createdAt: '' },
      { id: '7', date: '2023-01-07', weight: 74.4, bmi: 24, createdAt: '' },
    ]
    const result = calculateMetabolismStats(profile, records, 7)
    expect(result.isDataSufficient).toBe(true)
    expect(result.trendDays).toBe(7)
    // -0.1kg/day * 7700 = -770 kcal/day
    expect(result.tdeeTrend).toBeCloseTo(-770, -1)
  })

  it('should handle missing days correctly with OLS regression', () => {
    const records: WeightRecord[] = [
      { id: '1', date: '2023-01-01', weight: 75.0, bmi: 24, createdAt: '' },
      // Missed 01-02, 01-03
      { id: '4', date: '2023-01-04', weight: 74.4, bmi: 24, createdAt: '' }, // Should have been 74.4 at -0.2kg/day
      { id: '7', date: '2023-01-07', weight: 73.8, bmi: 24, createdAt: '' }, // Should have been 73.8 at -0.2kg/day
    ]
    const result = calculateMetabolismStats(profile, records, 7)
    expect(result.isDataSufficient).toBe(true)
    expect(result.trendDays).toBe(7)
    // -0.2kg/day * 7700 = -1540 kcal/day
    expect(result.tdeeTrend).toBeCloseTo(-1540, -1)
  })
})
