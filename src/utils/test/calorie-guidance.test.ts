import { describe, expect, it } from 'vitest'

import type { Goal } from '@/types'

import { buildCalorieGuidance, classifyGainPace, classifyLossPace } from '../calorie-guidance'

const TODAY = '2026-06-20'

function lossGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    startWeight: 80,
    targetWeight: 70,
    startDate: '2026-06-01',
    isCompleted: false,
    ...overrides,
  }
}

describe('classifyLossPace', () => {
  it('treats slow loss as healthy', () => {
    expect(classifyLossPace(0.5, 80)).toBe('healthy')
  })

  it('flags >1kg/week or >1% bodyweight as aggressive', () => {
    expect(classifyLossPace(1.2, 200)).toBe('aggressive') // 1.2kg/week, 0.6% bodyweight
    expect(classifyLossPace(0.6, 50)).toBe('aggressive') // 1.2% of bodyweight
  })

  it('flags very fast loss as unsafe', () => {
    expect(classifyLossPace(2, 80)).toBe('unsafe')
  })
})

describe('classifyGainPace', () => {
  it('uses stricter thresholds than loss', () => {
    expect(classifyGainPace(0.5)).toBe('healthy')
    expect(classifyGainPace(1)).toBe('aggressive')
    expect(classifyGainPace(2)).toBe('unsafe')
  })
})

describe('buildCalorieGuidance', () => {
  it('returns empty when there is no goal or nothing remaining', () => {
    expect(
      buildCalorieGuidance({
        goal: null,
        remaining: 3,
        currentWeight: 80,
        today: TODAY,
        tdeeTrend: -300,
        isDataSufficient: true,
      }).pace,
    ).toBeNull()

    expect(
      buildCalorieGuidance({
        goal: lossGoal(),
        remaining: 0,
        currentWeight: 70,
        today: TODAY,
        tdeeTrend: -300,
        isDataSufficient: true,
      }).pace,
    ).toBeNull()
  })

  it('computes the daily adjustment needed to hit a target date', () => {
    const guidance = buildCalorieGuidance({
      goal: lossGoal({ targetDate: '2026-07-20' }), // 30 天后
      remaining: 5,
      currentWeight: 80,
      today: TODAY,
      tdeeTrend: -300, // 当前每天 300kcal 赤字
      isDataSufficient: true,
    })
    expect(guidance.paceSource).toBe('plan')
    expect(guidance.onTrack).toBe(false)
    // 需要 5/30*7700≈1283 kcal/天，当前已有 300 → 还需约 983
    expect(guidance.requiredDailyAdjustment).toBe(983)
    expect(guidance.pace).toBe('aggressive')
  })

  it('reports on-track when current pace already meets the target date', () => {
    const guidance = buildCalorieGuidance({
      goal: lossGoal({ targetDate: '2026-07-20' }),
      remaining: 5,
      currentWeight: 80,
      today: TODAY,
      tdeeTrend: -1400,
      isDataSufficient: true,
    })
    expect(guidance.onTrack).toBe(true)
    expect(guidance.requiredDailyAdjustment).toBe(0)
  })

  it('leaves plan adjustment null when metabolism data is insufficient', () => {
    const guidance = buildCalorieGuidance({
      goal: lossGoal({ targetDate: '2026-07-20' }),
      remaining: 5,
      currentWeight: 80,
      today: TODAY,
      tdeeTrend: null,
      isDataSufficient: false,
    })
    expect(guidance.paceSource).toBe('plan')
    expect(guidance.requiredDailyAdjustment).toBeNull()
    expect(guidance.onTrack).toBeNull()
  })

  it('assesses current pace when no target date is set', () => {
    const healthy = buildCalorieGuidance({
      goal: lossGoal(),
      remaining: 5,
      currentWeight: 80,
      today: TODAY,
      tdeeTrend: -500,
      isDataSufficient: true,
    })
    expect(healthy.paceSource).toBe('current')
    expect(healthy.pace).toBe('healthy')
    expect(healthy.paceMessage).toBeNull()

    const unsafe = buildCalorieGuidance({
      goal: lossGoal(),
      remaining: 5,
      currentWeight: 80,
      today: TODAY,
      tdeeTrend: -1800,
      isDataSufficient: true,
    })
    expect(unsafe.pace).toBe('unsafe')
    expect(unsafe.paceMessage).not.toBeNull()
  })

  it('ignores current pace that moves away from the goal', () => {
    const guidance = buildCalorieGuidance({
      goal: lossGoal(),
      remaining: 5,
      currentWeight: 80,
      today: TODAY,
      tdeeTrend: 400, // 减脂目标却在盈余 → 不评估为「朝目标推进」
      isDataSufficient: true,
    })
    expect(guidance.pace).toBeNull()
  })
})
