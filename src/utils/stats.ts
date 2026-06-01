import dayjs from 'dayjs'
import type { Goal, TimeRange, UserProfile, WeightRecord } from '../types'
import { calcBMI } from './bmi'

const RANGE_TO_DAYS: Record<TimeRange, number> = {
  '3d': 3,
  '7d': 7,
  '15d': 15,
  '1m': 30,
}

// 统一收口统计逻辑，避免多个页面重复计算。
export function getCurrentWeight(profile: UserProfile, records: WeightRecord[]): number {
  return records.at(-1)?.weight ?? profile.initialWeight
}

export function getSmoothedWeight(profile: UserProfile, records: WeightRecord[], days = 7): number {
  if (records.length === 0) return profile.initialWeight

  const recentRecords = filterRecordsByDays(records, days)
  if (recentRecords.length === 0) {
    return records.at(-1)!.weight
  }

  const sum = recentRecords.reduce((acc, r) => acc + r.weight, 0)
  return Number((sum / recentRecords.length).toFixed(1))
}

export function getCurrentBMI(profile: UserProfile, records: WeightRecord[]): number {
  return calcBMI(getCurrentWeight(profile, records), profile.height)
}

export function getPreviousDiff(records: WeightRecord[]): number | null {
  if (records.length < 2) return null
  const latest = records.at(-1)
  const previous = records.at(-2)
  if (!latest || !previous) return null
  return Number((latest.weight - previous.weight).toFixed(1))
}

export function filterRecordsByDays(records: WeightRecord[], days: number): WeightRecord[] {
  const cutoff = dayjs()
    .subtract(days - 1, 'day')
    .startOf('day')
  return records.filter(
    record => dayjs(record.date).isSame(cutoff, 'day') || dayjs(record.date).isAfter(cutoff),
  )
}

export function filterRecordsByRange(records: WeightRecord[], range: TimeRange) {
  return filterRecordsByDays(records, RANGE_TO_DAYS[range])
}

export function getWeeklyChange(records: WeightRecord[]): number | null {
  const weeklyRecords = filterRecordsByDays(records, 7)
  if (weeklyRecords.length < 2) return null
  const first = weeklyRecords[0]
  const latest = weeklyRecords.at(-1)
  if (!first || !latest) return null
  return Number((latest.weight - first.weight).toFixed(1))
}

export function getWeightStats(records: WeightRecord[]) {
  if (records.length === 0) {
    return {
      min: null,
      max: null,
      average: null,
      delta: null,
    }
  }

  const weights = records.map(record => record.weight)
  const total = weights.reduce((sum, value) => sum + value, 0)
  const latest = records.at(-1)
  const first = records[0]

  return {
    min: Number(Math.min(...weights).toFixed(1)),
    max: Number(Math.max(...weights).toFixed(1)),
    average: Number((total / weights.length).toFixed(1)),
    delta: latest && first ? Number((latest.weight - first.weight).toFixed(1)) : null,
  }
}

export function getGoalProgress(goal: Goal | null, currentWeight: number) {
  if (!goal) return null

  const totalDistance = Math.abs(goal.startWeight - goal.targetWeight)
  if (totalDistance === 0) {
    return {
      progress: 100,
      remaining: 0,
    }
  }

  const remainingDistance = Math.abs(currentWeight - goal.targetWeight)
  const traveledDistance = totalDistance - remainingDistance
  const progressRatio = traveledDistance / totalDistance

  return {
    progress: Math.min(100, Math.max(0, Math.round(progressRatio * 100))),
    remaining: Number(remainingDistance.toFixed(1)),
  }
}

export function buildTrendInsight(records: WeightRecord[]): string {
  if (records.length < 2) {
    return '样本还不够，再记录几次后，这里会给出更有参考价值的趋势洞察。'
  }

  const delta = getWeightStats(records).delta ?? 0
  if (delta < 0) {
    return `这段时间体重下降了 ${Math.abs(delta).toFixed(1)}kg，当前节奏保持得不错。`
  }
  if (delta > 0) {
    return `这段时间体重上升了 ${delta.toFixed(1)}kg，建议留意饮食与作息变化。`
  }
  return '最近体重整体较为稳定，说明你的记录波动控制得比较平稳。'
}
