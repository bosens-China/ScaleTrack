import { describe, expect, it } from 'vitest'

import type { Goal, UserProfile, WeightRecord } from '@/types'

import { migrateLegacyData, type MigrationStore } from '../storage'

// 内存版 KV，模拟 localforage 实例
function createMemoryStore(initial: Record<string, unknown> = {}): MigrationStore & {
  dump: () => Record<string, unknown>
} {
  const map = new Map<string, unknown>(Object.entries(initial))
  return {
    async getItem<T>(key: string) {
      return (map.has(key) ? (map.get(key) as T) : null) as T | null
    },
    async setItem<T>(key: string, value: T) {
      map.set(key, value)
      return value
    },
    dump: () => Object.fromEntries(map),
  }
}

const profile: UserProfile = {
  gender: 'male',
  height: 175,
  initialWeight: 80,
  createdAt: '2026-01-01T00:00:00.000Z',
}
const records: WeightRecord[] = [
  { id: 'r1', date: '2026-06-10', weight: 80, bmi: 26.1, createdAt: '2026-06-10T08:00:00.000Z' },
]
const goals: Goal[] = [
  { id: 'g1', targetWeight: 70, startWeight: 80, startDate: '2026-06-01', isCompleted: false },
]

describe('migrateLegacyData', () => {
  it('copies legacy data into an empty store and marks migrated', async () => {
    const kv = createMemoryStore()
    await migrateLegacyData(kv, { profile, records, goals })

    const dump = kv.dump()
    expect(dump.profile).toEqual(profile)
    expect(dump.records).toEqual(records)
    expect(dump.goals).toEqual(goals)
    expect(dump.__migrated_from_localstorage).toBe(true)
  })

  it('is idempotent: skips entirely when already migrated', async () => {
    const kv = createMemoryStore({ __migrated_from_localstorage: true })
    await migrateLegacyData(kv, { profile, records, goals })

    const dump = kv.dump()
    // 已标记迁移 → 不应写入任何业务数据
    expect(dump.profile).toBeUndefined()
    expect(dump.records).toBeUndefined()
  })

  it('does not overwrite data already present in the store', async () => {
    const existing: WeightRecord[] = [
      {
        id: 'keep',
        date: '2026-06-12',
        weight: 79,
        bmi: 25.8,
        createdAt: '2026-06-12T08:00:00.000Z',
      },
    ]
    const kv = createMemoryStore({ records: existing })
    await migrateLegacyData(kv, { profile, records, goals })

    const dump = kv.dump()
    // records 已存在 → 保留不覆盖；profile/goals 为空 → 正常迁入
    expect(dump.records).toEqual(existing)
    expect(dump.profile).toEqual(profile)
    expect(dump.goals).toEqual(goals)
  })

  it('handles absent legacy data without writing nulls', async () => {
    const kv = createMemoryStore()
    await migrateLegacyData(kv, { profile: null, records: null, goals: null })

    const dump = kv.dump()
    expect('profile' in dump).toBe(false)
    expect('records' in dump).toBe(false)
    expect(dump.__migrated_from_localstorage).toBe(true)
  })
})
