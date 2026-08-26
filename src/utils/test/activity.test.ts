import { describe, expect, it } from 'vitest'

import type { ActivityRecord } from '@/types'

import {
  findActivityRecordConflict,
  getActivityDaySummary,
  getActivityOverwriteRemovalIds,
  getActivityWeekFrequencies,
  getActivityWeekStats,
  getLatestActivityRecord,
} from '../activity'

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
  it('uses the latest saved record as the per-activity default', () => {
    const records = [
      activity('fitness-old', '2026-08-10', 45, '2026-08-10T08:00:00.000Z'),
      {
        ...activity('swimming-new', '2026-08-01', 60, '2026-08-01T08:00:00.000Z'),
        activityTypeId: 'builtin-swimming',
        updatedAt: '2026-08-20T12:00:00.000Z',
      },
      {
        ...activity('fitness-new', '2026-08-18', 75, '2026-08-18T08:00:00.000Z'),
        updatedAt: '2026-08-21T12:00:00.000Z',
      },
    ]

    expect(getLatestActivityRecord(records)?.id).toBe('fitness-new')
    expect(getLatestActivityRecord(records, ['builtin-fitness'])?.durationMinutes).toBe(75)
    expect(getLatestActivityRecord(records, ['builtin-swimming'])?.durationMinutes).toBe(60)
    expect(getLatestActivityRecord(records, ['builtin-running'])).toBeNull()
  })

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

  it('adapts weekly statistics to the English week boundary', () => {
    const stats = getActivityWeekStats(
      [activity('sunday', '2026-08-16', 30)],
      '2026-08-20',
      'en-US',
    )

    expect(stats.startDate).toBe('2026-08-16')
    expect(stats.endDate).toBe('2026-08-22')
    expect(stats.activeDays).toBe(1)
  })

  it('aggregates legacy same-type records and finds overwrite conflicts', () => {
    const records = [
      activity('run-1', '2026-08-20', 30),
      { ...activity('run-2', '2026-08-20', 20), activityTypeId: 'builtin-fitness' },
      { ...activity('run-3', '2026-08-20', 10), activityTypeId: 'builtin-fitness' },
    ]
    const summary = getActivityDaySummary(records, '2026-08-20')

    expect(summary).toMatchObject({ typeCount: 1, recordCount: 3, totalMinutes: 60 })
    expect(summary.items[0]).toMatchObject({ durationMinutes: 60, recordCount: 3 })
    expect(
      findActivityRecordConflict(records, {
        date: '2026-08-20',
        activityTypeId: 'builtin-fitness',
      })?.id,
    ).toBe('run-3')
    expect(
      findActivityRecordConflict(
        records,
        { date: '2026-08-20', activityTypeId: 'builtin-fitness' },
        'run-3',
      )?.id,
    ).toBe('run-2')
    expect(
      getActivityOverwriteRemovalIds(records, {
        keepId: 'run-3',
        editingId: 'editing-other-date',
        date: '2026-08-20',
        activityTypeId: 'builtin-fitness',
      }),
    ).toEqual(['run-1', 'run-2', 'editing-other-date'])
  })
})
