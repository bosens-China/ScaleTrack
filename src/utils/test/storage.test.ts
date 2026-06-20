import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { Goal, WeightRecord } from '@/types'

import { getGoals, getProfile, getRecords, importData, mergeImport } from '../storage'

function createLocalStorageMock(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}

describe('storage importData', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    globalThis.localStorage.clear()
  })

  it('should sort imported records by date before saving', () => {
    importData({
      version: 1,
      exportedAt: '2026-06-14T00:00:00.000Z',
      profile: {
        gender: 'male',
        height: 175,
        birthDate: '1995-06-14',
        initialWeight: 80,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      records: [
        {
          id: 'r-2',
          date: '2026-06-14',
          weight: 78,
          bmi: 25.5,
          createdAt: '2026-06-14T08:00:00.000Z',
        },
        {
          id: 'r-1',
          date: '2026-06-13',
          weight: 78.5,
          bmi: 25.6,
          createdAt: '2026-06-13T08:00:00.000Z',
        },
      ],
      goals: [
        {
          id: 'g-1',
          targetWeight: 75,
          startWeight: 80,
          startDate: '2026-06-01',
          isCompleted: false,
        },
      ],
    })

    expect(getProfile()?.gender).toBe('male')
    expect(getRecords().map(record => record.id)).toEqual(['r-1', 'r-2'])
    expect(getGoals()).toHaveLength(1)
  })

  it('should reject duplicate record dates', () => {
    expect(() =>
      importData({
        version: 1,
        exportedAt: '2026-06-14T00:00:00.000Z',
        profile: null,
        records: [
          {
            id: 'r-1',
            date: '2026-06-14',
            weight: 70,
            bmi: 22.2,
            createdAt: '2026-06-14T08:00:00.000Z',
          },
          {
            id: 'r-2',
            date: '2026-06-14',
            weight: 70.2,
            bmi: 22.3,
            createdAt: '2026-06-14T20:00:00.000Z',
          },
        ],
        goals: [],
      }),
    ).toThrow('同一天只能存在一条体重记录')
  })

  it('should reject invalid profile enum and datetime values', () => {
    expect(() =>
      importData({
        version: 1,
        exportedAt: '2026-06-14T00:00:00.000Z',
        profile: {
          gender: 'other',
          height: 175,
          initialWeight: 80,
          createdAt: 'not-a-date',
        },
        records: [],
        goals: [],
      }),
    ).toThrow('用户信息数据结构不完整或数值不合理')
  })

  it('should accept a goal with a valid targetDate', () => {
    importData({
      version: 1,
      exportedAt: '2026-06-14T00:00:00.000Z',
      profile: null,
      records: [],
      goals: [
        {
          id: 'g-1',
          targetWeight: 70,
          startWeight: 80,
          startDate: '2026-06-01',
          targetDate: '2026-09-01',
          isCompleted: false,
        },
      ],
    })

    expect(getGoals()[0]?.targetDate).toBe('2026-09-01')
  })

  it('should reject a goal with an invalid targetDate', () => {
    expect(() =>
      importData({
        version: 1,
        exportedAt: '2026-06-14T00:00:00.000Z',
        profile: null,
        records: [],
        goals: [
          {
            id: 'g-1',
            targetWeight: 70,
            startWeight: 80,
            startDate: '2026-06-01',
            targetDate: '2026/09/01',
            isCompleted: false,
          },
        ],
      }),
    ).toThrow('部分目标数据结构不完整或数值不合理')
  })

  it('should reject multiple active goals', () => {
    expect(() =>
      importData({
        version: 1,
        exportedAt: '2026-06-14T00:00:00.000Z',
        profile: null,
        records: [],
        goals: [
          {
            id: 'g-1',
            targetWeight: 70,
            startWeight: 75,
            startDate: '2026-06-01',
            isCompleted: false,
          },
          {
            id: 'g-2',
            targetWeight: 68,
            startWeight: 74,
            startDate: '2026-06-10',
            isCompleted: false,
          },
        ],
      }),
    ).toThrow('同时只能存在一个进行中的目标')
  })
})

function record(date: string, weight: number, createdAt: string): WeightRecord {
  return { id: `r-${date}-${createdAt}`, date, weight, bmi: 22, createdAt }
}

describe('mergeImport', () => {
  it('unions records by date and keeps the newer one on conflict', () => {
    const current = {
      profile: null,
      records: [
        record('2026-06-10', 80, '2026-06-10T08:00:00.000Z'),
        record('2026-06-11', 79.5, '2026-06-11T08:00:00.000Z'),
      ],
      goals: [],
    }
    const incoming = {
      profile: null,
      records: [
        // 同一天，createdAt 更新 → 应覆盖
        record('2026-06-11', 79.9, '2026-06-11T20:00:00.000Z'),
        record('2026-06-12', 79, '2026-06-12T08:00:00.000Z'),
      ],
      goals: [],
    }

    const merged = mergeImport(current, incoming)
    expect(merged.records.map(r => r.date)).toEqual(['2026-06-10', '2026-06-11', '2026-06-12'])
    expect(merged.records.find(r => r.date === '2026-06-11')?.weight).toBe(79.9)
  })

  it('keeps the existing record when its createdAt is newer', () => {
    const current = {
      profile: null,
      records: [record('2026-06-11', 79.5, '2026-06-11T20:00:00.000Z')],
      goals: [],
    }
    const incoming = {
      profile: null,
      records: [record('2026-06-11', 70, '2026-06-11T08:00:00.000Z')],
      goals: [],
    }
    expect(mergeImport(current, incoming).records[0].weight).toBe(79.5)
  })

  it('unions goals by id and enforces a single active goal (keeps current)', () => {
    const currentActive: Goal = {
      id: 'g-current',
      targetWeight: 70,
      startWeight: 80,
      startDate: '2026-06-01',
      isCompleted: false,
    }
    const milestone: Goal = {
      id: 'g-old',
      targetWeight: 78,
      startWeight: 82,
      startDate: '2026-01-01',
      completedDate: '2026-03-01',
      isCompleted: true,
    }
    const incomingActive: Goal = {
      id: 'g-incoming',
      targetWeight: 68,
      startWeight: 79,
      startDate: '2026-05-01',
      isCompleted: false,
    }

    const merged = mergeImport(
      { profile: null, records: [], goals: [currentActive, milestone] },
      { profile: null, records: [], goals: [incomingActive] },
    )

    const actives = merged.goals.filter(g => !g.isCompleted)
    expect(actives).toHaveLength(1)
    expect(actives[0].id).toBe('g-current')
    // 里程碑仍保留
    expect(merged.goals.some(g => g.id === 'g-old')).toBe(true)
  })

  it('adopts the incoming profile only when there is no current profile', () => {
    const incomingProfile = {
      gender: 'male' as const,
      height: 175,
      initialWeight: 80,
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    expect(
      mergeImport(
        { profile: null, records: [], goals: [] },
        { profile: incomingProfile, records: [], goals: [] },
      ).profile,
    ).toBe(incomingProfile)
  })
})

describe('storage importData merge mode', () => {
  it('merges into existing data instead of replacing', () => {
    importData(
      {
        version: 1,
        exportedAt: '2026-06-14T00:00:00.000Z',
        profile: null,
        records: [record('2026-06-10', 80, '2026-06-10T08:00:00.000Z')],
        goals: [],
      },
      'replace',
    )

    importData(
      {
        version: 1,
        exportedAt: '2026-06-15T00:00:00.000Z',
        profile: null,
        records: [record('2026-06-11', 79, '2026-06-11T08:00:00.000Z')],
        goals: [],
      },
      'merge',
    )

    expect(getRecords().map(r => r.date)).toEqual(['2026-06-10', '2026-06-11'])
  })
})
