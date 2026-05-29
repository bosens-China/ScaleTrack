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
