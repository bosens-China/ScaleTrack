import { describe, expect, it } from 'vitest'
import { isWeightOutlier, validateHeight, validateWeight } from '../validation'

describe('Validation Utils', () => {
  describe('validateWeight / validateHeight', () => {
    it('按范围校验体重与身高', () => {
      expect(validateWeight(70)).toBe(true)
      expect(validateWeight(10)).toBe(false)
      expect(validateHeight(175)).toBe(true)
      expect(validateHeight(300)).toBe(false)
    })
  })

  describe('isWeightOutlier', () => {
    it('无参考体重时不判定为异常', () => {
      expect(isWeightOutlier(70, null)).toBe(false)
      expect(isWeightOutlier(70, undefined)).toBe(false)
    })

    it('差值在阈值内不算异常', () => {
      expect(isWeightOutlier(70, 70)).toBe(false)
      expect(isWeightOutlier(74.9, 70)).toBe(false)
      expect(isWeightOutlier(65.1, 70)).toBe(false)
    })

    it('差值超过 5kg 判定为异常（双向）', () => {
      expect(isWeightOutlier(76, 70)).toBe(true)
      expect(isWeightOutlier(64, 70)).toBe(true)
      // 典型手滑/单位记错场景
      expect(isWeightOutlier(17, 70)).toBe(true)
    })
  })
})
