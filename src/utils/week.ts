import dayjs, { type Dayjs } from 'dayjs'

export type WeekStartsOn = 0 | 1

export interface WeekGroup<T> {
  key: string
  startDate: string
  endDate: string
  items: T[]
}

/** 中文以周一为首日；当前英文地区为 en-US，按当地习惯以周日为首日。 */
export function getWeekStartsOn(language: string): WeekStartsOn {
  return language === 'en-US' ? 0 : 1
}

export function getWeekStart(value: string | Dayjs, language: string): Dayjs {
  const date = typeof value === 'string' ? dayjs(value) : value
  const weekStartsOn = getWeekStartsOn(language)
  const offset = (date.day() - weekStartsOn + 7) % 7
  return date.startOf('day').subtract(offset, 'day')
}

export function getCalendarLeadingDays(month: Dayjs, language: string): number {
  return (month.startOf('month').day() - getWeekStartsOn(language) + 7) % 7
}

/** 根据地区首日补齐月历前置空格，便于各日期选择器复用同一网格。 */
export function getCalendarDates(month: Dayjs, language: string): (Dayjs | null)[] {
  const leadingDays = getCalendarLeadingDays(month, language)
  const dates: (Dayjs | null)[] = Array.from({ length: leadingDays }, () => null)

  for (let day = 1; day <= month.daysInMonth(); day++) {
    dates.push(month.date(day))
  }

  return dates
}

/** 通过 Intl 生成星期短名，便于后续新增语言时继续符合对应地区习惯。 */
export function getWeekdayLabels(language: string): string[] {
  const formatter = new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' })
  const sundayNoonUtc = Date.UTC(2024, 0, 7, 12)
  const startOffset = getWeekStartsOn(language)

  return Array.from({ length: 7 }, (_, index) => {
    const label = formatter.format(
      new Date(sundayNoonUtc + (startOffset + index) * 24 * 60 * 60 * 1000),
    )
    return language.startsWith('zh') ? label.replace(/^周/, '') : label
  })
}

/** 保留传入顺序，只为连续记录补充自然周分组。 */
export function groupRecordsByWeek<T>(
  items: T[],
  getDate: (item: T) => string,
  language: string,
): WeekGroup<T>[] {
  const groups: WeekGroup<T>[] = []

  for (const item of items) {
    const start = getWeekStart(getDate(item), language)
    const key = start.format('YYYY-MM-DD')
    const lastGroup = groups.at(-1)

    if (lastGroup?.key === key) {
      lastGroup.items.push(item)
      continue
    }

    groups.push({
      key,
      startDate: key,
      endDate: start.add(6, 'day').format('YYYY-MM-DD'),
      items: [item],
    })
  }

  return groups
}
