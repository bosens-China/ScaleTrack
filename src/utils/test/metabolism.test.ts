import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import type { UserProfile, WeightRecord } from '../../types'
import { calculateBMR, calculateMetabolismStats } from '../metabolism'

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
    birthDate: dayjs().subtract(30, 'year').format('YYYY-MM-DD'),
    initialWeight: 75,
    createdAt: '2023-01-01T00:00:00Z',
  }

  function record(id: string, date: string, weight: number): WeightRecord {
    return { id, date, weight, bmi: 24, createdAt: '' }
  }

  it('should return insufficient data if less than minDays', () => {
    const records: WeightRecord[] = [record('1', '2023-01-01', 75), record('2', '2023-01-04', 74)]
    const result = calculateMetabolismStats(profile, records, 7, 2)
    expect(result.isDataSufficient).toBe(false)
    expect(result.trendDays).toBe(4) // 01-01 to 01-04 is 4 days inclusive
  })

  it('should require enough records by default', () => {
    const records: WeightRecord[] = [
      record('1', '2023-01-01', 75),
      record('2', '2023-01-07', 74.4),
      record('3', '2023-01-14', 73.7),
    ]
    const result = calculateMetabolismStats(profile, records)
    expect(result.isDataSufficient).toBe(false)
    expect(result.trendDays).toBe(0)
  })

  it('should calculate trend correctly for a steady loss', () => {
    // Losing 0.1kg per day
    const records = Array.from({ length: 14 }, (_, index) =>
      record(
        `${index + 1}`,
        dayjs('2023-01-01').add(index, 'day').format('YYYY-MM-DD'),
        75 - index * 0.1,
      ),
    )
    const result = calculateMetabolismStats(profile, records)
    expect(result.isDataSufficient).toBe(true)
    expect(result.trendDays).toBe(14)
    // -0.1kg/day * 7700 = -770 kcal/day
    expect(result.tdeeTrend).toBeCloseTo(-770, -1)
  })

  it('should handle missing days correctly with OLS regression', () => {
    const records: WeightRecord[] = [
      record('1', '2023-01-01', 75.0),
      record('5', '2023-01-05', 74.2),
      record('10', '2023-01-10', 73.2),
      record('14', '2023-01-14', 72.4),
    ]
    const result = calculateMetabolismStats(profile, records)
    expect(result.isDataSufficient).toBe(true)
    expect(result.trendDays).toBe(14)
    // -0.2kg/day * 7700 = -1540 kcal/day
    expect(result.tdeeTrend).toBeCloseTo(-1540, -1)
  })
})
