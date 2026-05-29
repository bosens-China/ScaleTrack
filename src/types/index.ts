export type Gender = 'male' | 'female'

export interface UserProfile {
  gender: Gender
  height: number // cm
  initialWeight: number // kg
  createdAt: string // ISO string
}

export interface WeightRecord {
  id: string
  date: string // YYYY-MM-DD
  weight: number // kg
  bmi: number
  createdAt: string // ISO string
}

export interface Goal {
  id: string
  targetWeight: number
  startWeight: number
  startDate: string
  completedDate?: string
  isCompleted: boolean
}

export type TimeRange = '3d' | '7d' | '1m' | '3m'

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese'

export interface BMIRange {
  category: BMICategory
  label: string
  min: number
  max: number | null
  color: string
  description: string
}
