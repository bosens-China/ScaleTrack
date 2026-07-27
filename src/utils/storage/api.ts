import type {
  ActivityRecord,
  ActivityType,
  ExportData,
  Goal,
  UserProfile,
  WeightRecord,
} from '../../types'
import { BUILT_IN_ACTIVITY_TYPES } from '../activity'
import { cache, persist } from './core'
import { type ImportPayload, mergeImport, validateImportData } from './validation'

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

// ---- Activity records & types ----

export function getActivityRecords(): ActivityRecord[] {
  return cache.activityRecords
}

export function saveActivityRecord(record: ActivityRecord): void {
  const records = [...cache.activityRecords]
  const index = records.findIndex(item => item.id === record.id)
  if (index >= 0) records[index] = record
  else records.push(record)
  records.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
  cache.activityRecords = records
  persist('activityRecords')
}

export function deleteActivityRecord(id: string): void {
  cache.activityRecords = cache.activityRecords.filter(record => record.id !== id)
  persist('activityRecords')
}

export function getActivityTypes(): ActivityType[] {
  return [...BUILT_IN_ACTIVITY_TYPES, ...cache.customActivityTypes]
}

export function saveActivityType(type: ActivityType): void {
  cache.customActivityTypes = [...cache.customActivityTypes, type]
  persist('customActivityTypes')
}

export function deleteActivityType(id: string): void {
  cache.customActivityTypes = cache.customActivityTypes.filter(type => type.id !== id)
  persist('customActivityTypes')
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
    version: 2,
    exportedAt: new Date().toISOString(),
    profile: cache.profile,
    records: cache.records,
    goals: cache.goals,
    activityRecords: cache.activityRecords,
    activityTypes: cache.customActivityTypes,
  }
}

/** 导入数据，mode 为 replace（覆盖）或 merge（合并） */
export function importData(data: unknown, mode: 'replace' | 'merge' = 'replace'): void {
  const incoming = validateImportData(data)

  const next: ImportPayload =
    mode === 'merge'
      ? mergeImport(
          {
            profile: cache.profile,
            records: cache.records,
            goals: cache.goals,
            activityRecords: cache.activityRecords,
            activityTypes: cache.customActivityTypes,
          },
          incoming,
        )
      : incoming

  cache.profile = next.profile
  cache.records = next.records
  cache.goals = next.goals
  cache.activityRecords = next.activityRecords
  cache.customActivityTypes = next.activityTypes
  persist('profile')
  persist('records')
  persist('goals')
  persist('activityRecords')
  persist('customActivityTypes')
}
