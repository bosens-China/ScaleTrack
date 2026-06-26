import localforage from 'localforage'

import type { Goal, UserProfile, WeightRecord } from '../../types'
import { LEGACY_KEYS, STORE_KEYS } from './keys'
import { migrateLegacyData } from './migration'

/**
 * 本地数据存储层（基础设施）
 *
 * 设计：以 IndexedDB（localforage，自动回退 localStorage）为持久化后端，
 * 但对外仍暴露同步读写 API —— 会话期内以「内存缓存」为同步数据源，
 * 写操作写穿（write-through）到 IndexedDB。这样既获得 IndexedDB 的耐久性
 * （尤其 PWA 安装后可豁免 iOS 7 天清理），又不必把全应用改造成异步。
 *
 * 启动时需先 await hydrateStore() 完成水合（含旧 localStorage 一次性迁移）。
 */

export const store = localforage.createInstance({
  name: 'scaletrack',
  storeName: 'data',
  description: 'ScaleTrack 本地体重数据',
})

export interface CacheShape {
  profile: UserProfile | null
  records: WeightRecord[]
  goals: Goal[]
  lastBackupAt: string | null
}

// 会话期内的同步数据源（始终原地改属性，不重新绑定，便于跨模块共享同一引用）
export const cache: CacheShape = { profile: null, records: [], goals: [], lastBackupAt: null }
let hydrated = false

export type PersistKey = 'profile' | 'records' | 'goals' | 'lastBackupAt'

/** 写穿到 IndexedDB；失败仅告警，不阻塞 UI（内存缓存已更新） */
export function persist(key: PersistKey): void {
  store.setItem(key, cache[key]).catch(err => console.error(`持久化 ${key} 失败`, err))
}

function readLegacy<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * 一次性把旧 localStorage 数据迁入 IndexedDB。
 * 失败不打标记，下次启动重试（写入幂等，安全）；旧 localStorage 保留为只读备份。
 */
async function migrateLegacy(): Promise<void> {
  try {
    await migrateLegacyData(store, {
      profile: readLegacy<UserProfile>(LEGACY_KEYS.profile),
      records: readLegacy<WeightRecord[]>(LEGACY_KEYS.records),
      goals: readLegacy<Goal[]>(LEGACY_KEYS.goals),
    })
  } catch (err) {
    console.error('迁移旧数据失败，将在下次启动重试', err)
  }
}

/** 应用启动时调用：申请持久化存储、迁移旧数据、把数据水合进内存缓存 */
export async function hydrateStore(): Promise<void> {
  if (hydrated) return

  // 请求持久化存储，降低被浏览器清理的概率（失败无妨）
  try {
    await navigator.storage?.persist?.()
  } catch {
    // 忽略：部分环境不支持
  }

  await migrateLegacy()

  const [profile, records, goals, lastBackupAt] = await Promise.all([
    store.getItem<UserProfile | null>(STORE_KEYS.profile),
    store.getItem<WeightRecord[]>(STORE_KEYS.records),
    store.getItem<Goal[]>(STORE_KEYS.goals),
    store.getItem<string | null>(STORE_KEYS.lastBackupAt),
  ])

  cache.profile = profile ?? null
  cache.records = records ?? []
  cache.goals = goals ?? []
  cache.lastBackupAt = lastBackupAt ?? null
  hydrated = true
}
