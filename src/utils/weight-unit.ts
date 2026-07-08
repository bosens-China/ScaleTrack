import type { WeightUnit } from '../types'

/**
 * 体重单位工具
 *
 * 设计原则：localStorage 中所有体重始终以 kg（保留 1 位小数）为基准存储，
 * 仅在「展示」与「输入」环节按用户选择的单位换算。这样切换单位不会污染数据，
 * 也不会引入累积的换算误差。
 *
 * 1 斤 = 0.5 kg。
 */

/** 1 斤对应的千克数 */
export const KG_PER_JIN = 0.5

/** 各单位的中文/英文展示文案 */
export const WEIGHT_UNIT_LABEL: Record<WeightUnit, string> = {
  kg: 'kg',
  jin: '斤',
}

/** 可供切换的单位列表（用于设置项渲染） */
export const WEIGHT_UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: 'kg', label: '公斤 kg' },
  { value: 'jin', label: '斤' },
]

/** kg -> 展示单位的数值 */
export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  return unit === 'jin' ? kg / KG_PER_JIN : kg
}

/** 展示单位的数值 -> kg（统一保留 1 位小数，保持与存储精度一致） */
export function fromDisplayWeight(value: number, unit: WeightUnit): number {
  const kg = unit === 'jin' ? value * KG_PER_JIN : value
  return Number(kg.toFixed(1))
}

/** 仅返回展示单位下的数字字符串（不带单位后缀） */
export function formatWeightValue(kg: number, unit: WeightUnit, digits = 1): string {
  return toDisplayWeight(kg, unit).toFixed(digits)
}

/**
 * 返回带单位后缀的体重文案
 * @param opts.withSpace 数字与单位间是否留空格（默认 true，"60.0 kg"）
 * @param opts.sign 正数是否补 "+"（用于差值展示）
 */
export function formatWeight(
  kg: number,
  unit: WeightUnit,
  opts?: { digits?: number; withSpace?: boolean; sign?: boolean },
): string {
  const digits = opts?.digits ?? 1
  const display = toDisplayWeight(kg, unit)
  const prefix = opts?.sign && display > 0 ? '+' : ''
  const gap = opts?.withSpace === false ? '' : ' '
  return `${prefix}${display.toFixed(digits)}${gap}${WEIGHT_UNIT_LABEL[unit]}`
}
