import type { Goal, UserProfile, WeightRecord } from '../types'

const KEYS = {
  profile: 'scaletrack_profile',
  records: 'scaletrack_records',
  goals: 'scaletrack_goals',
} as const

// ---- Profile ----

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(KEYS.profile)
  return raw ? JSON.parse(raw) : null
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile))
}

export function updateProfile(patch: Partial<UserProfile>): UserProfile {
  const current = getProfile()!
  const updated = { ...current, ...patch }
  saveProfile(updated)
  return updated
}

// ---- Records ----

export function getRecords(): WeightRecord[] {
  const raw = localStorage.getItem(KEYS.records)
  return raw ? JSON.parse(raw) : []
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

export function getGoals(): Goal[] {
  const raw = localStorage.getItem(KEYS.goals)
  return raw ? JSON.parse(raw) : []
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

export interface ExportData {
  version: 1
  exportedAt: string
  profile: UserProfile | null
  records: WeightRecord[]
  goals: Goal[]
}

export function exportData(): ExportData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: getProfile(),
    records: getRecords(),
    goals: getGoals(),
  }
}

export function importData(data: ExportData): void {
  if (data.version !== 1) throw new Error('不支持的数据格式')
  if (data.profile === null) {
    localStorage.removeItem(KEYS.profile)
  } else {
    localStorage.setItem(KEYS.profile, JSON.stringify(data.profile))
  }
  localStorage.setItem(
    KEYS.records,
    JSON.stringify(Array.isArray(data.records) ? data.records : []),
  )
  localStorage.setItem(KEYS.goals, JSON.stringify(Array.isArray(data.goals) ? data.goals : []))
}
