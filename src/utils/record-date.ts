import dayjs from 'dayjs'

/** 允许补录的最长时间窗口：最近 1 个月（含今天） */
export const RECORD_BACKFILL_MONTHS = 1

export function getEarliestRecordDate(baseDate: string | Date = new Date()) {
  return dayjs(baseDate).subtract(RECORD_BACKFILL_MONTHS, 'month').format('YYYY-MM-DD')
}

export function isRecordDateSelectable(date: string, baseDate: string | Date = new Date()) {
  const earliestDate = getEarliestRecordDate(baseDate)
  const today = dayjs(baseDate).format('YYYY-MM-DD')
  return date >= earliestDate && date <= today
}
