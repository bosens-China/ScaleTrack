import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'

import { getCalendarLeadingDays, getWeekStart, getWeekdayLabels, groupRecordsByWeek } from '../week'

describe('本地化自然周', () => {
  it('中文从周一开始，英文美国地区从周日开始', () => {
    expect(getWeekStart('2026-08-20', 'zh-CN').format('YYYY-MM-DD')).toBe('2026-08-17')
    expect(getWeekStart('2026-08-20', 'en-US').format('YYYY-MM-DD')).toBe('2026-08-16')
    expect(getWeekdayLabels('zh-CN')).toEqual(['一', '二', '三', '四', '五', '六', '日'])
    expect(getWeekdayLabels('en-US')).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
  })

  it('按语言计算月历前置空格', () => {
    const august = dayjs('2026-08-01')
    expect(getCalendarLeadingDays(august, 'zh-CN')).toBe(5)
    expect(getCalendarLeadingDays(august, 'en-US')).toBe(6)
  })

  it('保留记录顺序并按自然周分组', () => {
    const records = [{ date: '2026-08-20' }, { date: '2026-08-17' }, { date: '2026-08-16' }]
    const groups = groupRecordsByWeek(records, record => record.date, 'zh-CN')

    expect(groups.map(group => [group.startDate, group.endDate, group.items.length])).toEqual([
      ['2026-08-17', '2026-08-23', 2],
      ['2026-08-10', '2026-08-16', 1],
    ])
  })
})
