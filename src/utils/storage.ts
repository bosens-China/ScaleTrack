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

/** 校验 profile 必需字段及数值范围 */
function isValidProfile(p: unknown): p is UserProfile {
  if (typeof p !== 'object' || p === null) return false
  const obj = p as Record<string, unknown>
  if (
    !('gender' in obj) ||
    !('height' in obj) ||
    !('initialWeight' in obj) ||
    !('createdAt' in obj)
  )
    return false
  if (typeof obj.height !== 'number' || obj.height < 50 || obj.height > 250) return false
  if (typeof obj.initialWeight !== 'number' || obj.initialWeight < 20 || obj.initialWeight > 300)
    return false
  return true
}

/** 校验单条体重记录的必需字段及数值范围 */
function isValidRecord(r: unknown): r is WeightRecord {
  if (typeof r !== 'object' || r === null) return false
  const obj = r as Record<string, unknown>
  if (!('id' in obj) || !('date' in obj) || !('weight' in obj) || !('bmi' in obj)) return false
  if (typeof obj.weight !== 'number' || obj.weight < 20 || obj.weight > 300) return false
  if (typeof obj.bmi !== 'number') return false
  return true
}

/** 校验单条目标的必需字段及数值范围 */
function isValidGoal(g: unknown): g is Goal {
  if (typeof g !== 'object' || g === null) return false
  const obj = g as Record<string, unknown>
  if (
    !('id' in obj) ||
    !('targetWeight' in obj) ||
    !('startWeight' in obj) ||
    !('startDate' in obj) ||
    !('isCompleted' in obj)
  )
    return false
  if (typeof obj.targetWeight !== 'number' || obj.targetWeight < 20 || obj.targetWeight > 300)
    return false
  if (typeof obj.startWeight !== 'number' || obj.startWeight < 20 || obj.startWeight > 300)
    return false
  return true
}

/** 导入数据，包含版本号、结构完整性和数值范围校验 */
export function importData(data: ExportData): void {
  if (data.version !== 1) throw new Error('不支持的数据格式')

  // 校验 profile
  if (data.profile !== null && !isValidProfile(data.profile)) {
    throw new Error('用户信息数据结构不完整或数值不合理')
  }

  // 校验 records
  if (!Array.isArray(data.records)) throw new Error('记录数据格式错误')
  if (!data.records.every(isValidRecord)) {
    throw new Error('部分体重记录数据结构不完整或数值不合理')
  }

  // 校验 goals
  if (!Array.isArray(data.goals)) throw new Error('目标数据格式错误')
  if (!data.goals.every(isValidGoal)) {
    throw new Error('部分目标数据结构不完整或数值不合理')
  }

  // 校验通过，写入 localStorage
  if (data.profile === null) {
    localStorage.removeItem(KEYS.profile)
  } else {
    localStorage.setItem(KEYS.profile, JSON.stringify(data.profile))
  }
  localStorage.setItem(KEYS.records, JSON.stringify(data.records))
  localStorage.setItem(KEYS.goals, JSON.stringify(data.goals))
}
