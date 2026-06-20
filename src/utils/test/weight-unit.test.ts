import { describe, expect, it } from 'vitest'

import { formatWeight, formatWeightValue, fromDisplayWeight, toDisplayWeight } from '../weight-unit'

describe('weight-unit', () => {
  describe('toDisplayWeight', () => {
    it('keeps kg unchanged', () => {
      expect(toDisplayWeight(60, 'kg')).toBe(60)
    })

    it('converts kg to 斤 (1kg = 2斤)', () => {
      expect(toDisplayWeight(60, 'jin')).toBe(120)
      expect(toDisplayWeight(60.1, 'jin')).toBeCloseTo(120.2, 5)
    })
  })

  describe('fromDisplayWeight', () => {
    it('keeps kg unchanged and rounds to 0.1', () => {
      expect(fromDisplayWeight(60, 'kg')).toBe(60)
      expect(fromDisplayWeight(60.16, 'kg')).toBe(60.2)
    })

    it('converts 斤 back to kg', () => {
      expect(fromDisplayWeight(120, 'jin')).toBe(60)
      expect(fromDisplayWeight(121, 'jin')).toBe(60.5)
    })

    it('round-trips through display and back without drift', () => {
      const kg = 73.4
      expect(fromDisplayWeight(toDisplayWeight(kg, 'jin'), 'jin')).toBe(kg)
    })
  })

  describe('formatWeightValue', () => {
    it('formats the numeric part in the target unit', () => {
      expect(formatWeightValue(60, 'kg')).toBe('60.0')
      expect(formatWeightValue(60, 'jin')).toBe('120.0')
    })
  })

  describe('formatWeight', () => {
    it('appends the unit label with a space by default', () => {
      expect(formatWeight(60, 'kg')).toBe('60.0 kg')
      expect(formatWeight(60, 'jin')).toBe('120.0 斤')
    })

    it('omits the space when withSpace is false', () => {
      expect(formatWeight(60, 'kg', { withSpace: false })).toBe('60.0kg')
    })

    it('adds a leading + for positive values when sign is requested', () => {
      expect(formatWeight(1.2, 'kg', { sign: true })).toBe('+1.2 kg')
      expect(formatWeight(-1.2, 'kg', { sign: true })).toBe('-1.2 kg')
      expect(formatWeight(0, 'kg', { sign: true })).toBe('0.0 kg')
    })
  })
})
