import { describe, expect, it } from 'vitest'
import type { Goal, UserProfile, WeightRecord } from '../../types'
import {
  buildTrendInsight,
  getCurrentWeight,
  getGoalProgress,
  getMetricStats,
  movingAverage,
} from '../stats'

describe('Stats Utils', () => {
  const mockProfile: UserProfile = {
    gender: 'male',
    height: 175,
    initialWeight: 80.0,
    createdAt: '2026-06-01',
  }

  const mockRecords: WeightRecord[] = [
    { id: '1', date: '2026-06-01', weight: 80.0, bmi: 26.1, createdAt: '' },
    { id: '2', date: '2026-06-02', weight: 79.5, bmi: 26.0, createdAt: '' },
    { id: '3', date: '2026-06-03', weight: 79.0, bmi: 25.8, createdAt: '' },
    { id: '4', date: '2026-06-04', weight: 78.5, bmi: 25.6, createdAt: '' },
    { id: '5', date: '2026-06-05', weight: 81.0, bmi: 26.4, createdAt: '' },
  ]

  describe('getCurrentWeight', () => {
    it('should return initial weight if no records', () => {
      expect(getCurrentWeight(mockProfile, [])).toBe(80.0)
    })

    it('should return the latest record weight', () => {
      expect(getCurrentWeight(mockProfile, mockRecords)).toBe(81.0)
    })
  })

  describe('getGoalProgress', () => {
    it('should return null if goal is null', () => {
      expect(getGoalProgress(null, 80, [])).toBeNull()
    })

    it('should handle weight loss goal and best progress logic', () => {
      const goal: Goal = {
        id: 'g1',
        targetWeight: 75.0,
        startWeight: 80.0,
        startDate: '2026-06-01',
        isCompleted: false,
      }

      const progress = getGoalProgress(goal, 81.0, mockRecords)

      // Goal 80 -> 75 (Distance: 5)
      // Best weight in records: 78.5 (Distance traveled: 1.5)
      // Best Progress = 1.5 / 5 = 30%
      // Current weight: 81.0 (Worse than start weight)
      // Current Progress = -1.0 / 5 = -20% -> bounded to 0%
      // Remaining = 81.0 - 75.0 = 6.0

      expect(progress).toEqual({
        progress: 30,
        currentProgress: 0,
        remaining: 6.0,
      })
    })

    it('should handle weight gain goal', () => {
      const gainGoal: Goal = {
        id: 'g2',
        targetWeight: 85.0,
        startWeight: 80.0,
        startDate: '2026-06-01',
        isCompleted: false,
      }

      const gainRecords: WeightRecord[] = [
        { id: '1', date: '2026-06-01', weight: 80.0, bmi: 26.1, createdAt: '' },
        { id: '2', date: '2026-06-02', weight: 82.5, bmi: 26.9, createdAt: '' }, // Best
        { id: '3', date: '2026-06-03', weight: 81.0, bmi: 26.4, createdAt: '' }, // Current
      ]

      const progress = getGoalProgress(gainGoal, 81.0, gainRecords)

      // Goal 80 -> 85 (Distance: 5)
      // Best weight: 82.5 -> Progress = 2.5 / 5 = 50%
      // Current weight: 81.0 -> Progress = 1.0 / 5 = 20%
      // Remaining = 85 - 81 = 4.0

      expect(progress).toEqual({
        progress: 50,
        currentProgress: 20,
        remaining: 4.0,
      })
    })

    it('should return 100% when distance is 0', () => {
      const instantGoal: Goal = {
        id: 'g3',
        targetWeight: 80.0,
        startWeight: 80.0,
        startDate: '2026-06-01',
        isCompleted: false,
      }
      expect(getGoalProgress(instantGoal, 80.0, mockRecords)).toEqual({
        progress: 100,
        currentProgress: 100,
        remaining: 0,
      })
    })
  })

  describe('getMetricStats', () => {
    it('should calculate bmi stats when metric is bmi', () => {
      expect(getMetricStats(mockRecords, 'bmi')).toEqual({
        min: 25.6,
        max: 26.4,
        average: 26,
        delta: 0.3,
      })
    })
  })

  describe('buildTrendInsight', () => {
    it('should build bmi insight with the correct metric wording', () => {
      expect(buildTrendInsight(mockRecords, 'bmi')).toContain('BMI 上升了 0.3')
    })
  })

  describe('movingAverage', () => {
    it('首点等于自身，窗口内取尾部平均', () => {
      // 窗口 3：[1, (1+2)/2=1.5, (1+2+3)/3=2, (2+3+4)/3=3]
      expect(movingAverage([1, 2, 3, 4], 3)).toEqual([1, 1.5, 2, 3])
    })

    it('输出长度与输入一致，结果保留 1 位小数', () => {
      const result = movingAverage([80, 79.5, 79, 78.6, 78.2], 7)
      expect(result).toHaveLength(5)
      expect(result[4]).toBe(79.1) // (80+79.5+79+78.6+78.2)/5 = 79.06 -> 79.1
    })

    it('空数组返回空数组', () => {
      expect(movingAverage([])).toEqual([])
    })
  })
})
