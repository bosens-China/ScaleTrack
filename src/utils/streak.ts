import dayjs from 'dayjs'

import type { WeightRecord } from '../types'

export interface StreakInfo {
  /** 截至今天（或昨天）的连续打卡天数；中断则为 0 */
  current: number
  /** 历史上最长的连续打卡天数 */
  longest: number
}

/**
 * 计算连续打卡天数（按自然日，每天有任意记录即算打卡）。
 *
 * - longest：历史最长连续天数
 * - current：以最近一次记录结尾的连续天数，且最近记录须为今天或昨天才算「仍在延续」，
 *   （给今天还没记录留一天缓冲），否则视为已中断返回 0。
 */
export function calculateStreak(records: WeightRecord[], today: string): StreakInfo {
  if (records.length === 0) return { current: 0, longest: 0 }

  // 去重并按日期升序
  const dates = [...new Set(records.map(r => r.date))].sort()

  let longest = 1
  let run = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = dayjs(dates[i]).diff(dayjs(dates[i - 1]), 'day')
    run = diff === 1 ? run + 1 : 1
    if (run > longest) longest = run
  }

  const last = dates[dates.length - 1]
  const gapFromToday = dayjs(today).diff(dayjs(last), 'day')

  let current = 0
  // 最近记录是今天或昨天时，连续仍然成立
  if (gapFromToday <= 1) {
    current = 1
    for (let i = dates.length - 1; i > 0; i--) {
      const diff = dayjs(dates[i]).diff(dayjs(dates[i - 1]), 'day')
      if (diff === 1) current++
      else break
    }
  }

  return { current, longest }
}
