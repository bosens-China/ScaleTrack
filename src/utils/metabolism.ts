import dayjs from 'dayjs'
import type { Gender, MetabolismStats, UserProfile, WeightRecord } from '../types'

/**
 * 计算静态基础代谢率 (BMR) - Mifflin-St Jeor 公式
 */
export function calculateBMR(
  gender: Gender,
  weight: number,
  height: number,
  age?: number,
): number | null {
  if (!age || age <= 0) return null

  // 男性: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
  // 女性: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
  let bmr = 10 * weight + 6.25 * height - 5 * age
  if (gender === 'male') {
    bmr += 5
  } else {
    bmr -= 161
  }
  return Math.max(0, Math.round(bmr))
}

/**
 * 线性回归计算体重趋势（斜率表示每天体重变化 kg/day）
 */
function calculateWeightTrendSlope(records: WeightRecord[]): number {
  if (records.length < 2) return 0

  // 按照日期排序
  const sorted = [...records].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
  const firstDate = dayjs(sorted[0].date)

  // 构造 x (经过的天数), y (体重)
  const points = sorted.map(r => ({
    x: dayjs(r.date).diff(firstDate, 'day'),
    y: r.weight,
  }))

  const n = points.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  points.forEach(p => {
    sumX += p.x
    sumY += p.y
    sumXY += p.x * p.y
    sumXX += p.x * p.x
  })

  const denominator = n * sumXX - sumX * sumX
  if (denominator === 0) return 0 // 防止除以0（例如所有点都在同一天）

  const slope = (n * sumXY - sumX * sumY) / denominator
  return slope
}

/**
 * 综合计算代谢表现
 * @param profile 用户配置
 * @param records 体重记录（建议传入最近 30 天的数据）
 * @param minDays 最小需要的天数（默认7天）
 */
export function calculateMetabolismStats(
  profile: UserProfile,
  records: WeightRecord[],
  minDays: number = 7,
): MetabolismStats {
  // 1. 计算当前静态 BMR
  const currentWeight = records.at(-1)?.weight ?? profile.initialWeight
  const bmr = calculateBMR(profile.gender, currentWeight, profile.height, profile.age)

  // 2. 过滤有效天数
  if (records.length < 2) {
    return { bmr, tdeeTrend: null, trendDays: 0, isDataSufficient: false }
  }

  // 计算记录跨越的自然天数
  const sorted = [...records].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
  const firstDate = dayjs(sorted[0].date)
  const lastDate = dayjs(sorted.at(-1)!.date)
  // 加1是因为首尾包含，比如 1号到7号，是 7 - 1 = 6，但是跨度是7天
  const trendDays = lastDate.diff(firstDate, 'day') + 1

  if (trendDays < minDays) {
    return { bmr, tdeeTrend: null, trendDays, isDataSufficient: false }
  }

  // 3. 计算日均热量盈亏
  const slope = calculateWeightTrendSlope(sorted)
  // 1 kg = 7700 kcal
  const tdeeTrend = Math.round(slope * 7700)

  return {
    bmr,
    tdeeTrend,
    trendDays,
    isDataSufficient: true,
  }
}
