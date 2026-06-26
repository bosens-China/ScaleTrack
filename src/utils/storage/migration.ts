import type { Goal, UserProfile, WeightRecord } from '../../types'
import { STORE_KEYS } from './keys'

/** 迁移所需的最小键值存储接口（localforage 实例即满足，便于测试注入） */
export interface MigrationStore {
  getItem<T>(key: string): Promise<T | null>
  setItem<T>(key: string, value: T): Promise<T>
}

export interface LegacySnapshot {
  profile: UserProfile | null
  records: WeightRecord[] | null
  goals: Goal[] | null
}

/**
 * 迁移核心逻辑（纯粹依赖注入的 store，便于单测）：
 * - 已迁移过则直接返回
 * - 仅在目标 store 对应 key 为空时写入旧数据（幂等，不覆盖已有数据）
 * - 全部写完才打迁移标记
 */
export async function migrateLegacyData(kv: MigrationStore, legacy: LegacySnapshot): Promise<void> {
  const done = await kv.getItem<boolean>(STORE_KEYS.migrated)
  if (done) return

  if (legacy.profile !== null && (await kv.getItem(STORE_KEYS.profile)) == null) {
    await kv.setItem(STORE_KEYS.profile, legacy.profile)
  }
  if (legacy.records !== null && (await kv.getItem(STORE_KEYS.records)) == null) {
    await kv.setItem(STORE_KEYS.records, legacy.records)
  }
  if (legacy.goals !== null && (await kv.getItem(STORE_KEYS.goals)) == null) {
    await kv.setItem(STORE_KEYS.goals, legacy.goals)
  }

  await kv.setItem(STORE_KEYS.migrated, true)
}
