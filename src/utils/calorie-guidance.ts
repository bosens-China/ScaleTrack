import dayjs from 'dayjs'

import type { Goal } from '../types'

/**
 * 热量建议与健康速度护栏
 *
 * 沿用应用「无感热量追踪」的理念：不依赖活动系数去估算绝对摄入，
 * 而是以「体重变化速率 × 7700kcal/kg」反推每日能量盈亏，给出相对当前节奏的可执行建议，
 * 并对过快的减重/增重速度给出健康提醒。
 */

/** 1 kg 体脂约等于的热量 */
const KCAL_PER_KG = 7700

export type PaceLevel = 'healthy' | 'aggressive' | 'unsafe'

/**
 * 评估减重速度是否健康。
 * 通用安全区：每周 ≤ 1% 体重且 ≤ 1kg；超过判为偏快，明显超过判为过快。
 */
export function classifyLossPace(weeklyRateKg: number, currentWeight: number): PaceLevel {
  const pct = currentWeight > 0 ? (weeklyRateKg / currentWeight) * 100 : 0
  if (weeklyRateKg > 1.5 || pct > 1.5) return 'unsafe'
  if (weeklyRateKg > 1.0 || pct > 1.0) return 'aggressive'
  return 'healthy'
}

/**
 * 评估增重速度是否健康（增肌阶段过快增重多为脂肪，阈值更严）。
 */
export function classifyGainPace(weeklyRateKg: number): PaceLevel {
  if (weeklyRateKg > 1.5) return 'unsafe'
  if (weeklyRateKg > 0.75) return 'aggressive'
  return 'healthy'
}

export interface CalorieGuidanceInput {
  goal: Goal | null
  /** 距目标体重还差多少 kg（朝目标方向的剩余量，>=0） */
  remaining: number | null
  /** 当前体重 kg，用于按体重比例评估速度 */
  currentWeight: number
  /** 今天 YYYY-MM-DD */
  today: string
  /** 近期日均热量盈亏（kcal/day，负为赤字），数据不足时为 null */
  tdeeTrend: number | null
  /** 代谢趋势数据是否充足 */
  isDataSufficient: boolean
}

export interface CalorieGuidance {
  /** 速度评估等级；无法评估时为 null */
  pace: PaceLevel | null
  /** 评估依据：plan=按目标日期需要的速度，current=按当前实际速度 */
  paceSource: 'plan' | 'current' | null
  /** 评估所用的每周变化幅度（kg，正数） */
  paceWeeklyKg: number | null
  /** 为按目标日期达成，相对当前节奏每天还需多制造的热量缺口/盈余（kcal，正数）；onTrack 时为 0 */
  requiredDailyAdjustment: number | null
  /** 按当前节奏是否已能在目标日期前达成；无法判断时为 null */
  onTrack: boolean | null
  /** 健康速度护栏提示，速度健康或无法评估时为 null */
  paceMessage: string | null
}

const EMPTY: CalorieGuidance = {
  pace: null,
  paceSource: null,
  paceWeeklyKg: null,
  requiredDailyAdjustment: null,
  onTrack: null,
  paceMessage: null,
}

function buildPaceMessage(level: PaceLevel, isGain: boolean, weeklyKg: number): string | null {
  const rate = `约 ${weeklyKg.toFixed(1)}kg/周`
  if (isGain) {
    if (level === 'unsafe')
      return `增重速度偏快（${rate}），过快增重容易堆积脂肪，建议放缓并配合力量训练。`
    if (level === 'aggressive') return `增重速度较快（${rate}），注意控制饮食结构、优先增肌。`
    return null
  }
  if (level === 'unsafe')
    return `减重速度偏快（${rate}），过快减重可能流失肌肉、损害代谢，建议放缓节奏、保证营养。`
  if (level === 'aggressive') return `减重速度较快（${rate}），记得保证蛋白质与必要营养摄入。`
  return null
}

/**
 * 综合给出热量建议与速度护栏。
 */
export function buildCalorieGuidance(input: CalorieGuidanceInput): CalorieGuidance {
  const { goal, remaining, currentWeight, today, tdeeTrend, isDataSufficient } = input
  if (!goal || remaining === null || remaining <= 0) return EMPTY

  const isGain = goal.targetWeight > goal.startWeight
  // 当前朝目标方向的日均热量进度（正数表示在朝目标推进）
  const currentProgressKcal =
    isDataSufficient && tdeeTrend !== null ? (isGain ? tdeeTrend : -tdeeTrend) : null

  // 设了目标日期：按「需要的速度」给计划与每日调整建议
  if (goal.targetDate) {
    const daysLeft = dayjs(goal.targetDate).diff(dayjs(today), 'day')
    if (daysLeft > 0) {
      const requiredRatePerDay = remaining / daysLeft
      const paceWeeklyKg = Number((requiredRatePerDay * 7).toFixed(2))
      const pace = isGain
        ? classifyGainPace(paceWeeklyKg)
        : classifyLossPace(paceWeeklyKg, currentWeight)

      let requiredDailyAdjustment: number | null = null
      let onTrack: boolean | null = null
      if (currentProgressKcal !== null) {
        const requiredDailyKcal = requiredRatePerDay * KCAL_PER_KG
        const gap = Math.round(requiredDailyKcal - currentProgressKcal)
        onTrack = gap <= 50 // 留 50kcal 容差，避免临界点反复提示
        requiredDailyAdjustment = onTrack ? 0 : gap
      }

      return {
        pace,
        paceSource: 'plan',
        paceWeeklyKg,
        requiredDailyAdjustment,
        onTrack,
        paceMessage: buildPaceMessage(pace, isGain, paceWeeklyKg),
      }
    }
  }

  // 未设目标日期：依据当前实际速度评估是否健康（仅在确实朝目标推进时）
  if (currentProgressKcal !== null && currentProgressKcal > 0) {
    const currentRatePerDay = currentProgressKcal / KCAL_PER_KG
    const paceWeeklyKg = Number((currentRatePerDay * 7).toFixed(2))
    const pace = isGain
      ? classifyGainPace(paceWeeklyKg)
      : classifyLossPace(paceWeeklyKg, currentWeight)
    return {
      pace,
      paceSource: 'current',
      paceWeeklyKg,
      requiredDailyAdjustment: null,
      onTrack: null,
      paceMessage: buildPaceMessage(pace, isGain, paceWeeklyKg),
    }
  }

  return EMPTY
}
