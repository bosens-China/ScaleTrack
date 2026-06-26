import { describe, expect, it } from 'vitest'
import {
  getAutoNoteTag,
  getDefaultNote,
  getTimeOfDay,
  toggleTagInNote,
  WEIGH_IN_TAGS,
} from '../note'

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

  describe('getAutoNoteTag', () => {
    it('早晨时段带入“晨起空腹”（且属于标签词表）', () => {
      expect(getAutoNoteTag(5)).toBe('晨起空腹')
      expect(getAutoNoteTag(8)).toBe('晨起空腹')
      expect(getAutoNoteTag(9)).toBe('晨起空腹')
      expect(WEIGH_IN_TAGS).toContain('晨起空腹')
    })

    it('其它时段不带入自由文本，返回空串', () => {
      expect(getAutoNoteTag(0)).toBe('')
      expect(getAutoNoteTag(4)).toBe('')
      expect(getAutoNoteTag(10)).toBe('')
      expect(getAutoNoteTag(15)).toBe('')
      expect(getAutoNoteTag(22)).toBe('')
    })
  })

  describe('getDefaultNote', () => {
    it('默认备注等价于按当前时段推断的标签，不再复制旧记录备注', () => {
      expect(getDefaultNote(8)).toBe('晨起空腹')
      expect(getDefaultNote(15)).toBe('')
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
