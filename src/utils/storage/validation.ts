import type { ActivityRecord, ActivityType, Goal, UserProfile, WeightRecord } from '../../types'

// ---- 通用类型守卫 ----

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
  if ('updatedAt' in r && r.updatedAt !== undefined && !isValidIsoDatetime(r.updatedAt))
    return false
  if ('note' in r && r.note !== undefined && typeof r.note !== 'string') return false
  return true
}

function getRecordModifiedAt(record: WeightRecord) {
  return record.updatedAt ?? record.createdAt
}

function isValidActivityType(type: unknown): type is ActivityType {
  if (!isPlainObject(type)) return false
  if (!isNonEmptyString(type.id) || !isNonEmptyString(type.name)) return false
  if (!isNonEmptyString(type.icon) || !/^#[0-9a-f]{6}$/i.test(String(type.color))) return false
  if (type.isBuiltIn !== false) return false
  if (!isValidIsoDatetime(type.createdAt)) return false
  return true
}

function isValidActivityRecord(record: unknown): record is ActivityRecord {
  if (!isPlainObject(record)) return false
  if (!isNonEmptyString(record.id) || !isNonEmptyString(record.activityTypeId)) return false
  if (!isNonEmptyString(record.activityName) || !isNonEmptyString(record.activityIcon)) return false
  if (!/^#[0-9a-f]{6}$/i.test(String(record.activityColor))) return false
  if (!isValidDateString(record.date)) return false
  if (
    !isFiniteNumber(record.durationMinutes) ||
    record.durationMinutes < 5 ||
    record.durationMinutes > 1440
  )
    return false
  if (!isValidIsoDatetime(record.createdAt)) return false
  if (
    'updatedAt' in record &&
    record.updatedAt !== undefined &&
    !isValidIsoDatetime(record.updatedAt)
  )
    return false
  if ('note' in record && record.note !== undefined && typeof record.note !== 'string') return false
  return true
}

function getActivityRecordModifiedAt(record: ActivityRecord) {
  return record.updatedAt ?? record.createdAt
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
  activityRecords: ActivityRecord[]
  activityTypes: ActivityType[]
}

/** 校验导入数据结构并返回规范化后的载荷（按日期排序的记录）；不写入存储 */
export function validateImportData(data: unknown): ImportPayload {
  if (!isPlainObject(data)) throw new Error('导入数据必须是对象')
  if (data.version !== 1 && data.version !== 2) throw new Error('不支持的数据格式')
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

  const activityRecords = data.version === 1 ? [] : data.activityRecords
  const activityTypes = data.version === 1 ? [] : data.activityTypes

  if (!Array.isArray(activityRecords) || !activityRecords.every(isValidActivityRecord)) {
    throw new Error('部分运动记录数据结构不完整或数值不合理')
  }
  if (new Set(activityRecords.map(record => record.id)).size !== activityRecords.length) {
    throw new Error('运动记录 ID 重复')
  }
  if (!Array.isArray(activityTypes) || !activityTypes.every(isValidActivityType)) {
    throw new Error('自定义运动类型数据结构不完整')
  }
  if (new Set(activityTypes.map(type => type.id)).size !== activityTypes.length) {
    throw new Error('运动类型 ID 重复')
  }
  const normalizedTypeNames = activityTypes.map(type => type.name.trim().toLocaleLowerCase())
  if (new Set(normalizedTypeNames).size !== normalizedTypeNames.length) {
    throw new Error('运动类型名称重复')
  }

  const sortedRecords = [...(data.records as WeightRecord[])].sort((a, b) =>
    a.date.localeCompare(b.date),
  )
  const sortedActivityRecords = [...(activityRecords as ActivityRecord[])].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
  )

  return {
    profile: data.profile as UserProfile | null,
    records: sortedRecords,
    goals: data.goals as Goal[],
    activityRecords: sortedActivityRecords,
    activityTypes: activityTypes as ActivityType[],
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
    if (!existing || getRecordModifiedAt(r) > getRecordModifiedAt(existing)) byDate.set(r.date, r)
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

  const activityRecordsById = new Map<string, ActivityRecord>()
  for (const record of current.activityRecords) activityRecordsById.set(record.id, record)
  for (const record of incoming.activityRecords) {
    const existing = activityRecordsById.get(record.id)
    if (!existing || getActivityRecordModifiedAt(record) > getActivityRecordModifiedAt(existing)) {
      activityRecordsById.set(record.id, record)
    }
  }
  const activityRecords = [...activityRecordsById.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
  )

  const activityTypesByName = new Map<string, ActivityType>()
  for (const type of current.activityTypes) {
    activityTypesByName.set(type.name.trim().toLocaleLowerCase(), type)
  }
  for (const type of incoming.activityTypes) {
    const name = type.name.trim().toLocaleLowerCase()
    if (!activityTypesByName.has(name)) activityTypesByName.set(name, type)
  }

  return {
    profile: current.profile ?? incoming.profile,
    records,
    goals,
    activityRecords,
    activityTypes: [...activityTypesByName.values()],
  }
}
