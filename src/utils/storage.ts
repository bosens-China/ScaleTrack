import localforage from 'localforage'

import type { ExportData, Goal, UserProfile, WeightRecord } from '../types'

/**
 * 本地数据存储层
 *
 * 设计：以 IndexedDB（localforage，自动回退 localStorage）为持久化后端，
 * 但对外仍暴露同步读写 API —— 会话期内以「内存缓存」为同步数据源，
 * 写操作写穿（write-through）到 IndexedDB。这样既获得 IndexedDB 的耐久性
 * （尤其 PWA 安装后可豁免 iOS 7 天清理），又不必把全应用改造成异步。
 *
 * 启动时需先 await hydrateStore() 完成水合（含旧 localStorage 一次性迁移）。
 */

// 旧版本使用的 localStorage key（迁移来源，迁移后保留为只读备份）
const LEGACY_KEYS = {
  profile: 'scaletrack_profile',
  records: 'scaletrack_records',
  goals: 'scaletrack_goals',
} as const

// IndexedDB 内的 key
const STORE_KEYS = {
  profile: 'profile',
  records: 'records',
  goals: 'goals',
  lastBackupAt: 'lastBackupAt',
  migrated: '__migrated_from_localstorage',
} as const

const store = localforage.createInstance({
  name: 'scaletrack',
  storeName: 'data',
  description: 'ScaleTrack 本地体重数据',
})

interface CacheShape {
  profile: UserProfile | null
  records: WeightRecord[]
  goals: Goal[]
  lastBackupAt: string | null
}

// 会话期内的同步数据源
let cache: CacheShape = { profile: null, records: [], goals: [], lastBackupAt: null }
let hydrated = false

type PersistKey = 'profile' | 'records' | 'goals' | 'lastBackupAt'

/** 写穿到 IndexedDB；失败仅告警，不阻塞 UI（内存缓存已更新） */
function persist(key: PersistKey): void {
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

  cache = {
    profile: profile ?? null,
    records: records ?? [],
    goals: goals ?? [],
    lastBackupAt: lastBackupAt ?? null,
  }
  hydrated = true
}

// ---- Profile ----

export function getProfile(): UserProfile | null {
  return cache.profile
}

export function saveProfile(profile: UserProfile): void {
  cache.profile = profile
  persist('profile')
}

/** 局部更新用户信息，用户信息不存在时抛出异常 */
export function updateProfile(patch: Partial<UserProfile>): UserProfile {
  if (!cache.profile) throw new Error('用户信息不存在')
  cache.profile = { ...cache.profile, ...patch }
  persist('profile')
  return cache.profile
}

// ---- Records ----

export function getRecords(): WeightRecord[] {
  return cache.records
}

export function saveRecord(record: WeightRecord): void {
  const records = [...cache.records]
  const idx = records.findIndex(r => r.date === record.date)
  if (idx >= 0) {
    records[idx] = record
  } else {
    records.push(record)
  }
  records.sort((a, b) => a.date.localeCompare(b.date))
  cache.records = records
  persist('records')
}

export function saveRecords(records: WeightRecord[]): void {
  cache.records = [...records].sort((a, b) => a.date.localeCompare(b.date))
  persist('records')
}

export function deleteRecord(id: string): void {
  cache.records = cache.records.filter(r => r.id !== id)
  persist('records')
}

// ---- Goals ----

export function getGoals(): Goal[] {
  return cache.goals
}

export function saveGoal(goal: Goal): void {
  const goals = [...cache.goals]
  const idx = goals.findIndex(g => g.id === goal.id)
  if (idx >= 0) {
    goals[idx] = goal
  } else {
    goals.push(goal)
  }
  cache.goals = goals
  persist('goals')
}

/** 删除指定目标（用于「放弃当前目标」） */
export function deleteGoal(id: string): void {
  cache.goals = cache.goals.filter(g => g.id !== id)
  persist('goals')
}

export function getActiveGoal(): Goal | null {
  return cache.goals.find(g => !g.isCompleted) ?? null
}

export function getMilestones(): Goal[] {
  return cache.goals.filter(g => g.isCompleted)
}

// ---- 备份时间 ----

export function getLastBackupAt(): string | null {
  return cache.lastBackupAt
}

/** 记录一次成功导出的时间，用于备份提醒 */
export function recordBackup(at: string = new Date().toISOString()): void {
  cache.lastBackupAt = at
  persist('lastBackupAt')
}

// ---- Import/Export ----

export function exportData(): ExportData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: cache.profile,
    records: cache.records,
    goals: cache.goals,
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidDateString(value: unknown): value is string {
  return (
    isNonEmptyString(value) &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))
  )
}

function isValidIsoDatetime(value: unknown): value is string {
  return (
    isNonEmptyString(value) && /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value))
  )
}

/** 校验 profile 必需字段及数值范围 */
function isValidProfile(p: unknown): p is UserProfile {
  if (!isPlainObject(p)) return false
  if (p.gender !== 'male' && p.gender !== 'female') return false
  if (!isFiniteNumber(p.height) || p.height < 50 || p.height > 250) return false
  if (!isFiniteNumber(p.initialWeight) || p.initialWeight < 20 || p.initialWeight > 300)
    return false
  if (!isValidIsoDatetime(p.createdAt)) return false
  if ('age' in p && p.age !== undefined && (!isFiniteNumber(p.age) || p.age < 10 || p.age > 120))
    return false
  if ('birthDate' in p && p.birthDate !== undefined && !isValidDateString(p.birthDate)) return false
  if ('nickname' in p && p.nickname !== undefined && typeof p.nickname !== 'string') return false
  if ('avatar' in p && p.avatar !== undefined && typeof p.avatar !== 'string') return false
  if (
    'weightUnit' in p &&
    p.weightUnit !== undefined &&
    p.weightUnit !== 'kg' &&
    p.weightUnit !== 'jin'
  )
    return false
  return true
}

/** 校验单条体重记录的必需字段及数值范围 */
function isValidRecord(r: unknown): r is WeightRecord {
  if (!isPlainObject(r)) return false
  if (!isNonEmptyString(r.id)) return false
  if (!isValidDateString(r.date)) return false
  if (!isFiniteNumber(r.weight) || r.weight < 20 || r.weight > 300) return false
  if (!isFiniteNumber(r.bmi) || r.bmi <= 0 || r.bmi > 100) return false
  if (!isValidIsoDatetime(r.createdAt)) return false
  if ('note' in r && r.note !== undefined && typeof r.note !== 'string') return false
  return true
}

/** 校验单条目标的必需字段及数值范围 */
function isValidGoal(g: unknown): g is Goal {
  if (!isPlainObject(g)) return false
  if (!isNonEmptyString(g.id)) return false
  if (!isFiniteNumber(g.targetWeight) || g.targetWeight < 20 || g.targetWeight > 300) return false
  if (!isFiniteNumber(g.startWeight) || g.startWeight < 20 || g.startWeight > 300) return false
  if (!isValidDateString(g.startDate)) return false
  if ('targetDate' in g && g.targetDate !== undefined && !isValidDateString(g.targetDate))
    return false
  if (typeof g.isCompleted !== 'boolean') return false
  if ('completedDate' in g && g.completedDate !== undefined && !isValidDateString(g.completedDate))
    return false
  if (g.isCompleted && !isValidDateString(g.completedDate)) return false
  if (g.completedDate && g.completedDate < g.startDate) return false
  return true
}

export interface ImportPayload {
  profile: UserProfile | null
  records: WeightRecord[]
  goals: Goal[]
}

/** 校验导入数据结构并返回规范化后的载荷（按日期排序的记录）；不写入存储 */
export function validateImportData(data: unknown): ImportPayload {
  if (!isPlainObject(data)) throw new Error('导入数据必须是对象')
  if (data.version !== 1) throw new Error('不支持的数据格式')
  if (!isValidIsoDatetime(data.exportedAt)) throw new Error('导出时间格式错误')

  // 校验 profile
  if (data.profile !== null && !isValidProfile(data.profile)) {
    throw new Error('用户信息数据结构不完整或数值不合理')
  }

  // 校验 records
  if (!Array.isArray(data.records)) throw new Error('记录数据格式错误')
  if (!data.records.every(isValidRecord)) {
    throw new Error('部分体重记录数据结构不完整或数值不合理')
  }
  if (new Set(data.records.map(record => record.id)).size !== data.records.length) {
    throw new Error('体重记录 ID 重复')
  }
  if (new Set(data.records.map(record => record.date)).size !== data.records.length) {
    throw new Error('同一天只能存在一条体重记录')
  }

  // 校验 goals
  if (!Array.isArray(data.goals)) throw new Error('目标数据格式错误')
  if (!data.goals.every(isValidGoal)) {
    throw new Error('部分目标数据结构不完整或数值不合理')
  }
  if (new Set(data.goals.map(goal => goal.id)).size !== data.goals.length) {
    throw new Error('目标 ID 重复')
  }
  if (data.goals.filter(goal => !goal.isCompleted).length > 1) {
    throw new Error('同时只能存在一个进行中的目标')
  }

  const sortedRecords = [...(data.records as WeightRecord[])].sort((a, b) =>
    a.date.localeCompare(b.date),
  )

  return {
    profile: data.profile as UserProfile | null,
    records: sortedRecords,
    goals: data.goals as Goal[],
  }
}

/**
 * 合并导入：以当前数据为基础，并入导入数据。
 * - 记录：按日期取并集，冲突保留 createdAt 更新的一条
 * - 目标：按 id 取并集；若出现多个进行中目标，仅保留当前的进行中目标
 * - 资料：当前已有则保留当前，否则采用导入的
 */
export function mergeImport(current: ImportPayload, incoming: ImportPayload): ImportPayload {
  const byDate = new Map<string, WeightRecord>()
  for (const r of current.records) byDate.set(r.date, r)
  for (const r of incoming.records) {
    const existing = byDate.get(r.date)
    if (!existing || r.createdAt > existing.createdAt) byDate.set(r.date, r)
  }
  const records = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))

  const byId = new Map<string, Goal>()
  for (const g of current.goals) byId.set(g.id, g)
  for (const g of incoming.goals) if (!byId.has(g.id)) byId.set(g.id, g)
  let goals = [...byId.values()]

  // 保证「最多一个进行中目标」：冲突时保留当前的进行中目标
  const actives = goals.filter(g => !g.isCompleted)
  if (actives.length > 1) {
    const keep = current.goals.find(g => !g.isCompleted) ?? actives[0]
    goals = goals.filter(g => g.isCompleted || g.id === keep.id)
  }

  return {
    profile: current.profile ?? incoming.profile,
    records,
    goals,
  }
}

/** 导入数据，mode 为 replace（覆盖）或 merge（合并） */
export function importData(data: unknown, mode: 'replace' | 'merge' = 'replace'): void {
  const incoming = validateImportData(data)

  const next =
    mode === 'merge'
      ? mergeImport(
          { profile: cache.profile, records: cache.records, goals: cache.goals },
          incoming,
        )
      : incoming

  cache.profile = next.profile
  cache.records = next.records
  cache.goals = next.goals
  persist('profile')
  persist('records')
  persist('goals')
}
