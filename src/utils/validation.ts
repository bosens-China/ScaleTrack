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
