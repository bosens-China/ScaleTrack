import { describe, expect, it } from 'vitest'

import type { WeightRecord } from '@/types'

import { calculateStreak } from '../streak'

function rec(date: string): WeightRecord {
  return { id: date, date, weight: 70, bmi: 22, createdAt: `${date}T08:00:00.000Z` }
}

describe('calculateStreak', () => {
  it('returns zero for no records', () => {
    expect(calculateStreak([], '2026-06-20')).toEqual({ current: 0, longest: 0 })
  })

  it('counts a consecutive run ending today', () => {
    const records = [rec('2026-06-18'), rec('2026-06-19'), rec('2026-06-20')]
    expect(calculateStreak(records, '2026-06-20')).toEqual({ current: 3, longest: 3 })
  })

  it('keeps current streak alive when last record was yesterday', () => {
    const records = [rec('2026-06-18'), rec('2026-06-19')]
    expect(calculateStreak(records, '2026-06-20').current).toBe(2)
  })

  it('treats a gap of 2+ days as broken (current = 0)', () => {
    const records = [rec('2026-06-15'), rec('2026-06-16')]
    const result = calculateStreak(records, '2026-06-20')
    expect(result.current).toBe(0)
    expect(result.longest).toBe(2)
  })

  it('reports the longest run even when the current streak is shorter', () => {
    const records = [
      rec('2026-06-01'),
      rec('2026-06-02'),
      rec('2026-06-03'),
      rec('2026-06-04'), // 4 连
      rec('2026-06-19'),
      rec('2026-06-20'), // 当前 2 连
    ]
    expect(calculateStreak(records, '2026-06-20')).toEqual({ current: 2, longest: 4 })
  })

  it('deduplicates multiple records on the same day', () => {
    const records = [rec('2026-06-19'), rec('2026-06-20')]
    // 同日重复不会发生（按日期唯一），但去重逻辑应稳健
    expect(calculateStreak([...records, rec('2026-06-20')], '2026-06-20').current).toBe(2)
  })
})
