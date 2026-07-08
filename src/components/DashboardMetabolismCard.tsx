import dayjs from 'dayjs'

import type { Goal, WeightRecord, WeightUnit } from '@/types'
import { buildCalorieGuidance } from '@/utils/calorie-guidance'
import {
  METABOLISM_MIN_DAYS,
  METABOLISM_MIN_RECORDS,
  type calculateMetabolismStats,
} from '@/utils/metabolism'
import { getGoalProgress, getWeeklyChange } from '@/utils/stats'
import { formatWeight } from '@/utils/weight-unit'

type MetabolismStats = ReturnType<typeof calculateMetabolismStats>

interface Props {
  metabolism: MetabolismStats
  records: WeightRecord[]
  goal: Goal | null
  progress: ReturnType<typeof getGoalProgress>
  currentWeight: number
  unit: WeightUnit
}

/**
 * 仪表盘「近期身体表现」卡片：从仪表盘拆出，
 * 集中处理周变化、热量建议、预测达成天数等派生逻辑与展示。
 */
export default function DashboardMetabolismCard({
  metabolism,
  records,
  goal,
  progress,
  currentWeight,
  unit,
}: Props) {
  const todayStr = dayjs().format('YYYY-MM-DD')
  const isGainGoal = goal !== null && goal.targetWeight > goal.startWeight
  const weeklyChange = getWeeklyChange(records)

  const weeklyDirection =
    weeklyChange === null
      ? '暂无变化'
      : weeklyChange > 0
        ? '近7天增加'
        : weeklyChange < 0
          ? '近7天减少'
          : '近7天持平'
  const trendTone =
    weeklyChange === null
      ? 'text-[var(--carbon-text-secondary)]'
      : isGainGoal
        ? weeklyChange > 0
          ? 'text-[var(--color-success)]'
          : weeklyChange < 0
            ? 'text-[var(--color-danger)]'
            : 'text-[var(--carbon-text-secondary)]'
        : weeklyChange > 0
          ? 'text-[var(--color-danger)]'
          : weeklyChange < 0
            ? 'text-[var(--color-success)]'
            : 'text-[var(--carbon-text-secondary)]'

  // 距用户设定的目标日期还有多少天（未设置或已达成则为 null）
  const daysUntilTarget =
    goal?.targetDate && progress && progress.remaining > 0
      ? dayjs(goal.targetDate).diff(dayjs(todayStr), 'day')
      : null

  // 热量建议与健康速度护栏
  const calorieGuidance = buildCalorieGuidance({
    goal,
    remaining: progress?.remaining ?? null,
    currentWeight,
    today: todayStr,
    tdeeTrend: metabolism.tdeeTrend,
    isDataSufficient: metabolism.isDataSufficient,
  })

  // 基于近期体重趋势粗略估算剩余达成天数
  let predictedDays: number | null = null
  if (
    metabolism.isDataSufficient &&
    metabolism.tdeeTrend !== null &&
    goal &&
    progress &&
    progress.remaining > 0
  ) {
    if (isGainGoal && metabolism.tdeeTrend > 0) {
      predictedDays = Math.ceil((progress.remaining * 7700) / metabolism.tdeeTrend)
    } else if (!isGainGoal && metabolism.tdeeTrend < 0) {
      predictedDays = Math.ceil((progress.remaining * 7700) / Math.abs(metabolism.tdeeTrend))
    }
  }

  let targetDaysText = null
  if (predictedDays !== null) {
    targetDaysText = `按近期趋势粗略估计，约 ${predictedDays} 天可能达成目标。`
    // 用户设了目标日期时，对比预测与剩余天数，给出领先/落后提示
    if (daysUntilTarget !== null) {
      if (daysUntilTarget <= 0) {
        targetDaysText += ' 目标日期已到，继续加油。'
      } else if (predictedDays <= daysUntilTarget) {
        targetDaysText += ` 距目标日期还有 ${daysUntilTarget} 天，目前趋势大致领先于计划。`
      } else {
        targetDaysText += ` 距目标日期仅剩 ${daysUntilTarget} 天，后续可能需要调整节奏。`
      }
    }
  }

  return (
    <section className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4">
      <div className="flex items-center justify-between border-b border-[var(--carbon-border)] pb-3 mb-3">
        <div className="flex items-center gap-2 text-[var(--carbon-text-secondary)]">
          <span className="i-lucide-activity h-4 w-4 text-[var(--carbon-primary)]" />
          <span className="text-[11px] font-medium uppercase tracking-[0.12em]">近期身体表现</span>
        </div>
        {weeklyChange !== null && (
          <div className={`flex items-baseline gap-1 ${trendTone}`}>
            <span className="text-sm font-semibold">
              {formatWeight(weeklyChange, unit, { sign: true })}
            </span>
            <span className="text-[10px]">({weeklyDirection})</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--carbon-text-secondary)]">静态基础代谢 (BMR)</span>
          <span className="text-sm font-medium text-[var(--carbon-text)]">
            {metabolism.bmr ? `${metabolism.bmr} kcal` : '需设置年龄'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--carbon-text-secondary)]">日均热量趋势估算</span>
          {metabolism.isDataSufficient && metabolism.tdeeTrend !== null ? (
            <span
              className={`text-sm font-semibold ${metabolism.tdeeTrend < 0 ? 'text-[var(--color-success)]' : metabolism.tdeeTrend > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--carbon-text)]'}`}
            >
              {metabolism.tdeeTrend > 0 ? '+' : ''}
              {metabolism.tdeeTrend} kcal
            </span>
          ) : (
            <span className="text-xs text-[var(--carbon-text-secondary)]">
              数据不足 (需{METABOLISM_MIN_DAYS}天且{METABOLISM_MIN_RECORDS}条记录)
            </span>
          )}
        </div>
        {metabolism.isDataSufficient && metabolism.tdeeTrend !== null && (
          <div className="mt-1 flex items-start gap-1.5 rounded bg-[var(--carbon-surface-subtle)] p-3 border-l-2 border-[var(--carbon-primary)]">
            <span className="i-lucide-lightbulb h-4 w-4 mt-0.5 shrink-0 text-[var(--carbon-primary)]" />
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium leading-relaxed text-[var(--carbon-text)]">
                {metabolism.tdeeTrend < 0
                  ? '近期体重趋势显示可能处于热量赤字。'
                  : metabolism.tdeeTrend > 0
                    ? '近期体重趋势显示可能处于热量盈余。'
                    : '近期体重趋势基本稳定。'}
              </p>
              {targetDaysText && (
                <p className="text-[11px] leading-relaxed text-[var(--carbon-text-secondary)]">
                  {targetDaysText}
                </p>
              )}
              {calorieGuidance.requiredDailyAdjustment !== null &&
              calorieGuidance.requiredDailyAdjustment > 0 ? (
                <p className="text-[11px] leading-relaxed text-[var(--carbon-text-secondary)]">
                  要按目标日期达成，建议在当前基础上每天再多制造约{' '}
                  {calorieGuidance.requiredDailyAdjustment} kcal 的
                  {isGainGoal ? '热量盈余' : '热量缺口'}，仅作趋势参考。
                </p>
              ) : calorieGuidance.onTrack ? (
                <p className="text-[11px] leading-relaxed text-[var(--carbon-text-secondary)]">
                  当前趋势大致支持如期达成，继续观察即可。
                </p>
              ) : (
                !targetDaysText &&
                progress &&
                progress.remaining > 0 && (
                  <p className="text-[11px] leading-relaxed text-[var(--carbon-text-secondary)]">
                    保持当前节奏，适度调整饮食结构以{isGainGoal ? '增加' : '减少'}热量摄入。
                  </p>
                )
              )}
            </div>
          </div>
        )}

        {/* 健康速度护栏：减重/增重过快时给出提醒（不依赖代谢数据是否充足） */}
        {calorieGuidance.paceMessage && (
          <div className="mt-1 flex items-start gap-1.5 rounded bg-[var(--carbon-surface-subtle)] p-3 border-l-2 border-[var(--color-warning)]">
            <span className="i-lucide-triangle-alert h-4 w-4 mt-0.5 shrink-0 text-[var(--color-warning)]" />
            <p className="text-[11px] leading-relaxed text-[var(--carbon-text)]">
              {calorieGuidance.paceMessage}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
