export type Gender = 'male' | 'female'

/** 体重展示/输入单位（存储始终为 kg） */
export type WeightUnit = 'kg' | 'jin'

export interface UserProfile {
  gender: Gender
  height: number // cm
  /** @deprecated use birthDate instead */
  age?: number
  birthDate?: string // YYYY-MM-DD
  initialWeight: number // kg
  createdAt: string // ISO string
  nickname?: string
  avatar?: string
  /** 体重展示/输入单位偏好，缺省视为 kg */
  weightUnit?: WeightUnit
}

export interface MetabolismStats {
  bmr: number | null
  tdeeTrend: number | null // kcal/day trend estimate, negative means likely deficit
  trendDays: number
  isDataSufficient: boolean
}

export interface WeightRecord {
  id: string
  date: string // YYYY-MM-DD
  weight: number // kg
  bmi: number
  note?: string
  createdAt: string // ISO string
  updatedAt?: string // ISO string
}

/** 运动类型；内置类型由应用提供，自定义类型会写入本地存储 */
export interface ActivityType {
  id: string
  name: string
  icon: string
  color: string
  isBuiltIn: boolean
  createdAt?: string
}

/** 单次运动记录保留类型快照，删除自定义类型后历史记录仍可正常展示 */
export interface ActivityRecord {
  id: string
  activityTypeId: string
  activityName: string
  activityIcon: string
  activityColor: string
  date: string // YYYY-MM-DD
  durationMinutes: number
  note?: string
  createdAt: string // ISO string
  updatedAt?: string // ISO string
}

/** 运动新增与编辑共用载荷；overwriteId 表示用户已确认合并同日同类记录。 */
export interface ActivitySavePayload {
  id?: string
  overwriteId?: string
  activityTypeId: string
  date: string
  durationMinutes: number
  note?: string
}

export interface Goal {
  id: string
  targetWeight: number
  startWeight: number
  startDate: string
  /** 用户自定义的期望达成日期（选填，YYYY-MM-DD） */
  targetDate?: string
  completedDate?: string
  isCompleted: boolean
}

export type TimeRange = '3d' | '7d' | '15d' | '1m' | '3m' | '6m'

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese'

export interface BMIRange {
  category: BMICategory
  label: string
  min: number
  max: number | null
  color: string
  description: string
}

/** 底部导航栏的五个真实 Tab */
export type AppTab = 'dashboard' | 'trends' | 'add' | 'activity' | 'profile'

/** 应用内所有可导航的页面（含不属于底部 Tab 的子页面） */
export type AppPage = AppTab | 'edit-user-info' | 'milestone-detail'

/** 数据导入/导出的标准结构 */
export interface ExportData {
  version: 2
  exportedAt: string
  profile: UserProfile | null
  records: WeightRecord[]
  goals: Goal[]
  activityRecords: ActivityRecord[]
  activityTypes: ActivityType[]
}
