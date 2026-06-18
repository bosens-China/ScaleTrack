import type { ExportData, Goal, UserProfile, WeightRecord } from '../types'

const KEYS = {
  profile: 'scaletrack_profile',
  records: 'scaletrack_records',
  goals: 'scaletrack_goals',
} as const

// ---- Profile ----

/** 获取用户信息，localStorage 数据损坏时自动清理并返回 null */
export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(KEYS.profile)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(KEYS.profile)
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile))
}

/** 局部更新用户信息，用户信息不存在时抛出异常 */
export function updateProfile(patch: Partial<UserProfile>): UserProfile {
  const current = getProfile()
  if (!current) throw new Error('用户信息不存在')
  const updated = { ...current, ...patch }
  saveProfile(updated)
  return updated
}

// ---- Records ----

/** 获取所有体重记录，localStorage 数据损坏时自动清理并返回空数组 */
export function getRecords(): WeightRecord[] {
  const raw = localStorage.getItem(KEYS.records)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(KEYS.records)
    return []
  }
}

export function saveRecord(record: WeightRecord): void {
  const records = getRecords()
  const idx = records.findIndex(r => r.date === record.date)
  if (idx >= 0) {
    records[idx] = record
  } else {
    records.push(record)
  }
  records.sort((a, b) => a.date.localeCompare(b.date))
  localStorage.setItem(KEYS.records, JSON.stringify(records))
}

export function saveRecords(records: WeightRecord[]): void {
  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date))
  localStorage.setItem(KEYS.records, JSON.stringify(sortedRecords))
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter(r => r.id !== id)
  localStorage.setItem(KEYS.records, JSON.stringify(records))
}

// ---- Goals ----

/** 获取所有目标，localStorage 数据损坏时自动清理并返回空数组 */
export function getGoals(): Goal[] {
  const raw = localStorage.getItem(KEYS.goals)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(KEYS.goals)
    return []
  }
}

export function saveGoal(goal: Goal): void {
  const goals = getGoals()
  const idx = goals.findIndex(g => g.id === goal.id)
  if (idx >= 0) {
    goals[idx] = goal
  } else {
    goals.push(goal)
  }
  localStorage.setItem(KEYS.goals, JSON.stringify(goals))
}

export function getActiveGoal(): Goal | null {
  return getGoals().find(g => !g.isCompleted) ?? null
}

export function getMilestones(): Goal[] {
  return getGoals().filter(g => g.isCompleted)
}

// ---- Import/Export ----

export function exportData(): ExportData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: getProfile(),
    records: getRecords(),
    goals: getGoals(),
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

/** 导入数据，包含版本号、结构完整性和数值范围校验 */
export function importData(data: unknown): void {
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

  const sortedRecords = [...data.records].sort((a, b) => a.date.localeCompare(b.date))

  // 校验通过，写入 localStorage
  if (data.profile === null) {
    localStorage.removeItem(KEYS.profile)
  } else {
    localStorage.setItem(KEYS.profile, JSON.stringify(data.profile))
  }
  localStorage.setItem(KEYS.records, JSON.stringify(sortedRecords))
  localStorage.setItem(KEYS.goals, JSON.stringify(data.goals))
}
