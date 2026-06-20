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
  tdeeTrend: number | null // the actual deficit/surplus
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

/** 底部导航栏的四个真实 Tab */
export type AppTab = 'dashboard' | 'trends' | 'add' | 'profile'

/** 应用内所有可导航的页面（含不属于底部 Tab 的子页面） */
export type AppPage = AppTab | 'edit-user-info' | 'milestone-detail'

/** 数据导入/导出的标准结构 */
export interface ExportData {
  version: 1
  exportedAt: string
  profile: UserProfile | null
  records: WeightRecord[]
  goals: Goal[]
}
