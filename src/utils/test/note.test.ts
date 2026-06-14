import { describe, expect, it } from 'vitest'
import type { WeightRecord } from '../../types'
import { getDefaultNote, getTimeOfDay, toggleTagInNote } from '../note'

describe('Note Utils', () => {
  describe('getTimeOfDay', () => {
    it('should return correct time strings based on hour', () => {
      expect(getTimeOfDay(0)).toBe('凌晨')
      expect(getTimeOfDay(4)).toBe('凌晨')
      expect(getTimeOfDay(5)).toBe('早晨')
      expect(getTimeOfDay(9)).toBe('早晨')
      expect(getTimeOfDay(10)).toBe('中午')
      expect(getTimeOfDay(13)).toBe('中午')
      expect(getTimeOfDay(14)).toBe('下午')
      expect(getTimeOfDay(18)).toBe('下午')
      expect(getTimeOfDay(19)).toBe('晚上')
      expect(getTimeOfDay(23)).toBe('晚上')
    })
  })

  describe('getDefaultNote', () => {
    const mockHour = 8 // 早晨

    it('should return getTimeOfDay if latestRecord is missing or has no note', () => {
      expect(getDefaultNote(null, mockHour)).toBe('早晨')
      expect(getDefaultNote(undefined, mockHour)).toBe('早晨')

      const recordWithoutNote: WeightRecord = {
        id: '1',
        date: '2026-06-01',
        weight: 80,
        bmi: 25,
        createdAt: '',
      }
      expect(getDefaultNote(recordWithoutNote, mockHour)).toBe('早晨')
    })

    it('should return the note from the latest record if it exists', () => {
      const recordWithNote: WeightRecord = {
        id: '2',
        date: '2026-06-01',
        weight: 80,
        bmi: 25,
        createdAt: '',
        note: '晨起空腹',
      }
      expect(getDefaultNote(recordWithNote, mockHour)).toBe('晨起空腹')
    })
  })

  describe('toggleTagInNote', () => {
    it('should add the tag if the note is empty', () => {
      expect(toggleTagInNote('', '晨起空腹')).toBe('晨起空腹')
    })

    it('should append the tag if it does not exist', () => {
      expect(toggleTagInNote('早晨', '饭前')).toBe('早晨 饭前')
      expect(toggleTagInNote('早晨 饭前', '便后')).toBe('早晨 饭前 便后')
    })

    it('should remove the tag if it already exists', () => {
      expect(toggleTagInNote('早晨 饭前', '饭前')).toBe('早晨')
      expect(toggleTagInNote('晨起空腹', '晨起空腹')).toBe('')
      expect(toggleTagInNote('早晨 饭前 便后', '饭前')).toBe('早晨 便后')
    })
  })
})
