// 身高与体重的验证与范围标准定义（中文注释）
export const VALIDATION_LIMITS = {
  height: { min: 50, max: 250, errorMsg: '请输入有效的身高（50-250cm）' },
  weight: { min: 20, max: 300, errorMsg: '请输入有效的体重（20-300kg）' },
}

export function validateHeight(height: number | string): boolean {
  const h = typeof height === 'string' ? parseFloat(height) : height
  return !isNaN(h) && h >= VALIDATION_LIMITS.height.min && h <= VALIDATION_LIMITS.height.max
}

export function validateWeight(weight: number | string): boolean {
  const w = typeof weight === 'string' ? parseFloat(weight) : weight
  return !isNaN(w) && w >= VALIDATION_LIMITS.weight.min && w <= VALIDATION_LIMITS.weight.max
}

// 单次体重与最近一次记录的合理差值阈值（kg）。超过则在保存前二次确认，
// 拦截手滑/单位记错等导致的脏数据，避免污染趋势与代谢推算。
export const WEIGHT_OUTLIER_THRESHOLD_KG = 5

export function isWeightOutlier(
  weight: number,
  referenceWeight: number | null | undefined,
): boolean {
  if (referenceWeight === null || referenceWeight === undefined) return false
  return Math.abs(weight - referenceWeight) > WEIGHT_OUTLIER_THRESHOLD_KG
}
