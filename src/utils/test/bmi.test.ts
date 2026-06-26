import { describe, expect, it } from 'vitest'
import {
  calcBMI,
  getBMICategory,
  getBMIColor,
  getHealthyWeightRange,
  getRecommendedWeight,
} from '../bmi'

describe('BMI Utils', () => {
  describe('calcBMI', () => {
    it('should calculate BMI correctly and round to 1 decimal place', () => {
      // 70kg / (1.75m)^2 = 70 / 3.0625 = 22.857... -> 22.9
      expect(calcBMI(70, 175)).toBe(22.9)

      // 50kg / (1.60m)^2 = 50 / 2.56 = 19.531... -> 19.5
      expect(calcBMI(50, 160)).toBe(19.5)
    })

    it('should handle zero or negative inputs gracefully (prevent Infinity if needed, though basic math yields Infinity)', () => {
      expect(calcBMI(70, 0)).toBe(Infinity)
    })
  })

  describe('getBMICategory', () => {
    it('should return underweight for BMI < 18.5', () => {
      expect(getBMICategory(18.4)).toBe('underweight')
      expect(getBMICategory(15.0)).toBe('underweight')
    })

    it('should return normal for 18.5 <= BMI < 24.0', () => {
      expect(getBMICategory(18.5)).toBe('normal')
      expect(getBMICategory(22.0)).toBe('normal')
      expect(getBMICategory(23.9)).toBe('normal')
    })

    it('should return overweight for 24.0 <= BMI < 28.0', () => {
      expect(getBMICategory(24.0)).toBe('overweight')
      expect(getBMICategory(27.9)).toBe('overweight')
    })

    it('should return obese for BMI >= 28.0', () => {
      expect(getBMICategory(28.0)).toBe('obese')
      expect(getBMICategory(30.0)).toBe('obese')
    })
  })

  describe('getBMIColor', () => {
    it('should map BMI values to the correct CSS color variables', () => {
      expect(getBMIColor(18.0)).toBe('#06b6d4') // underweight
      expect(getBMIColor(22.0)).toBe('#10b981') // normal
      expect(getBMIColor(25.0)).toBe('#f59e0b') // overweight
      expect(getBMIColor(30.0)).toBe('#f43f5e') // obese
    })
  })

  describe('getRecommendedWeight', () => {
    it('返回 BMI 21.25 对应的体重（正常区间中值）', () => {
      // 175cm: 21.25 * 1.75^2 = 65.078 -> 65.1
      expect(getRecommendedWeight(175)).toBe(65.1)
      // 160cm: 21.25 * 1.60^2 = 54.4
      expect(getRecommendedWeight(160)).toBe(54.4)
    })

    it('推荐体重落在健康区间内', () => {
      const { min, max } = getHealthyWeightRange(175)
      const rec = getRecommendedWeight(175)
      expect(rec).toBeGreaterThan(min)
      expect(rec).toBeLessThan(max)
    })
  })

  describe('getHealthyWeightRange', () => {
    it('返回 BMI 18.5 与 24 对应的体重区间', () => {
      // 175cm: 18.5*3.0625=56.7, 24*3.0625=73.5
      expect(getHealthyWeightRange(175)).toEqual({ min: 56.7, max: 73.5 })
    })
  })
})
