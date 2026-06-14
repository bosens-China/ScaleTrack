import { describe, expect, it } from 'vitest'

import { getEarliestRecordDate, isRecordDateSelectable } from '../record-date'

describe('record-date', () => {
  it('should calculate the earliest backfill date from today', () => {
    expect(getEarliestRecordDate('2026-06-14')).toBe('2026-05-14')
    expect(getEarliestRecordDate('2026-03-31')).toBe('2026-02-28')
  })

  it('should allow today and the last month window', () => {
    expect(isRecordDateSelectable('2026-06-14', '2026-06-14')).toBe(true)
    expect(isRecordDateSelectable('2026-05-14', '2026-06-14')).toBe(true)
    expect(isRecordDateSelectable('2026-05-13', '2026-06-14')).toBe(false)
  })

  it('should reject future dates', () => {
    expect(isRecordDateSelectable('2026-06-15', '2026-06-14')).toBe(false)
  })
})
