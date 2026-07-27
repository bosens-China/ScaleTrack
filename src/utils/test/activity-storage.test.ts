import { describe, expect, it } from 'vitest'

import { validateImportData } from '../storage'

const base = {
  exportedAt: '2026-07-27T08:00:00.000Z',
  profile: null,
  records: [],
  goals: [],
}

describe('activity import validation', () => {
  it('keeps version 1 backups compatible by providing empty activity data', () => {
    const payload = validateImportData({ version: 1, ...base })

    expect(payload.activityRecords).toEqual([])
    expect(payload.activityTypes).toEqual([])
  })

  it('accepts version 2 activity records and custom types', () => {
    const payload = validateImportData({
      version: 2,
      ...base,
      activityRecords: [
        {
          id: 'activity-1',
          activityTypeId: 'custom-climbing',
          activityName: '攀岩',
          activityIcon: 'i-lucide-zap',
          activityColor: '#c7f36b',
          date: '2026-07-27',
          durationMinutes: 90,
          createdAt: '2026-07-27T08:00:00.000Z',
        },
      ],
      activityTypes: [
        {
          id: 'custom-climbing',
          name: '攀岩',
          icon: 'i-lucide-zap',
          color: '#c7f36b',
          isBuiltIn: false,
          createdAt: '2026-07-27T08:00:00.000Z',
        },
      ],
    })

    expect(payload.activityRecords[0]?.activityName).toBe('攀岩')
    expect(payload.activityTypes[0]?.name).toBe('攀岩')
  })

  it('rejects unreasonable activity duration', () => {
    expect(() =>
      validateImportData({
        version: 2,
        ...base,
        activityRecords: [
          {
            id: 'activity-1',
            activityTypeId: 'builtin-fitness',
            activityName: '健身',
            activityIcon: 'i-lucide-dumbbell',
            activityColor: '#c7f36b',
            date: '2026-07-27',
            durationMinutes: 0,
            createdAt: '2026-07-27T08:00:00.000Z',
          },
        ],
        activityTypes: [],
      }),
    ).toThrow('部分运动记录数据结构不完整或数值不合理')
  })
})
