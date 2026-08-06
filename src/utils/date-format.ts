import dayjs from 'dayjs'
import { getLang } from 'virtual:ai-i18n'

type DateFormat = 'full' | 'monthDay' | 'monthDayWeek'

/** 根据当前界面语言格式化日期，不改变数据保存的 ISO 日期值。 */
export function formatAppDate(value: string, format: DateFormat = 'full'): string {
  const date = dayjs(value)
  const isEnglish = getLang() === 'en-US'

  if (format === 'monthDay') return isEnglish ? date.format('MMM D') : date.format('MM月DD日')
  if (format === 'monthDayWeek')
    return isEnglish ? date.format('MMM D, ddd') : date.format('M月D日 ddd')
  return isEnglish ? date.format('MMM D, YYYY') : date.format('YYYY年MM月DD日')
}
