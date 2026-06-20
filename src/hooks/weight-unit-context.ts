import { createContext, useContext } from 'react'

import type { WeightUnit } from '@/types'

export interface WeightUnitContextValue {
  /** 当前生效的体重单位 */
  unit: WeightUnit
  /** 切换体重单位（会持久化到用户资料） */
  setUnit: (unit: WeightUnit) => void
}

/** 体重单位上下文，默认 kg，便于无 Provider 的测试环境直接渲染 */
export const WeightUnitContext = createContext<WeightUnitContextValue>({
  unit: 'kg',
  setUnit: () => {},
})

/** 在任意组件读取当前体重单位与切换方法 */
export function useWeightUnit(): WeightUnitContextValue {
  return useContext(WeightUnitContext)
}
