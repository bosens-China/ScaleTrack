import type { BMICategory, BMIRange } from '../types'

// 中国标准 BMI 分级
export const BMI_RANGES: BMIRange[] = [
  {
    category: 'underweight',
    label: '偏瘦',
    min: 0,
    max: 18.5,
    color: '#06b6d4',
    description: '体重过轻，建议适当增加营养',
  },
  {
    category: 'normal',
    label: '正常',
    min: 18.5,
    max: 24,
    color: '#10b981',
    description: '体重正常，请继续保持',
  },
  {
    category: 'overweight',
    label: '偏胖',
    min: 24,
    max: 28,
    color: '#f59e0b',
    description: '体重偏重，建议适当控制饮食和运动',
  },
  {
    category: 'obese',
    label: '肥胖',
    min: 28,
    max: null,
    color: '#f43f5e',
    description: '体重过重，建议咨询医生制定减重计划',
  },
]

export function calcBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Number((weight / (heightM * heightM)).toFixed(1))
}

// 中国标准 BMI 正常区间
export const HEALTHY_BMI = { min: 18.5, max: 24 } as const

// 健康体重区间（kg）：BMI 正常区间下限/上限对应的体重
export function getHealthyWeightRange(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100
  return {
    min: Number((HEALTHY_BMI.min * heightM * heightM).toFixed(1)),
    max: Number((HEALTHY_BMI.max * heightM * heightM).toFixed(1)),
  }
}

// 推荐体重（kg）：BMI 正常区间中值（21.25）对应的体重，
// 用作“该减/增多少合适”的锚点，避免用户对目标无从下手
export function getRecommendedWeight(heightCm: number): number {
  const heightM = heightCm / 100
  const midBmi = (HEALTHY_BMI.min + HEALTHY_BMI.max) / 2
  return Number((midBmi * heightM * heightM).toFixed(1))
}

export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 24) return 'normal'
  if (bmi < 28) return 'overweight'
  return 'obese'
}

export function getBMIColor(bmi: number): string {
  const category = getBMICategory(bmi)
  return BMI_RANGES.find(r => r.category === category)!.color
}

export function getBMIRange(category: BMICategory): BMIRange {
  return BMI_RANGES.find(r => r.category === category)!
}

/** 将 BMI 值映射为刻度条上的百分比位置（0-100） */
export function getBmiPercent(bmi: number): number {
  let percent: number
  if (bmi < 18.5) {
    percent = (bmi / 18.5) * 18.5
  } else if (bmi < 24) {
    percent = 18.5 + ((bmi - 18.5) / (24 - 18.5)) * 31.5
  } else if (bmi < 28) {
    percent = 50 + ((bmi - 24) / (28 - 24)) * 25
  } else {
    percent = 75 + Math.min(25, ((bmi - 28) / 7) * 25)
  }
  return Math.min(100, Math.max(0, percent))
}
