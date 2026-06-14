import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getGoals, getProfile, getRecords, importData } from '../storage'

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
