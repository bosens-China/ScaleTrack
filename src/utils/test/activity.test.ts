import { describe, expect, it } from 'vitest'

import type { ActivityRecord } from '@/types'

import { getActivityWeekFrequencies, getActivityWeekStats } from '../activity'

function activity(
  id: string,
  date: string,
  durationMinutes: number,
  createdAt = `${date}T08:00:00.000Z`,
): ActivityRecord {
  return {
    id,
    activityTypeId: 'builtin-fitness',
    activityName: '健身',
    activityIcon: 'i-lucide-dumbbell',
    activityColor: '#c7f36b',
    date,
    durationMinutes,
    createdAt,
  }
}

describe('activity statistics', () => {
  it('uses active days as frequency and keeps multiple sessions on the same day', () => {
    const records = [
      activity('a-1', '2026-07-27', 45),
      {
        ...activity('a-2', '2026-07-29', 60),
        activityTypeId: 'builtin-swimming',
        activityName: '游泳',
        activityColor: '#42d9f5',
      },
      activity('a-3', '2026-07-29', 30, '2026-07-29T18:00:00.000Z'),
      activity('a-4', '2026-08-02', 90),
      activity('outside', '2026-08-03', 45),
    ]

    const stats = getActivityWeekStats(records, '2026-07-30')

    expect(stats.startDate).toBe('2026-07-27')
    expect(stats.endDate).toBe('2026-08-02')
    expect(stats.activeDays).toBe(3)
    expect(stats.sessions).toBe(4)
    expect(stats.totalMinutes).toBe(225)
    expect(stats.days[2]).toMatchObject({ date: '2026-07-29', active: true, sessions: 2 })
    expect(stats.typeBreakdown).toEqual([
      { name: '健身', color: '#c7f36b', sessions: 3 },
      { name: '游泳', color: '#42d9f5', sessions: 1 },
    ])
  })

  it('returns a stable twelve-week series ending in the current week', () => {
    const weeks = getActivityWeekFrequencies(
      [activity('current', '2026-07-27', 45)],
      12,
      '2026-07-30',
    )

    expect(weeks).toHaveLength(12)
    expect(weeks.at(-1)).toMatchObject({
      startDate: '2026-07-27',
      activeDays: 1,
      sessions: 1,
    })
  })
})
