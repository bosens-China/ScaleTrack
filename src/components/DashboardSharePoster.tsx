import dayjs from 'dayjs'

import SharePosterModal from '@/components/SharePosterModal'
import type { Goal, UserProfile, WeightRecord, WeightUnit } from '@/types'
import { getBMICategory, getBMIRange } from '@/utils/bmi'
import {
  getCurrentBMI,
  getCurrentWeight,
  getGoalProgress,
  getMetricStats,
  getWeeklyChange,
} from '@/utils/stats'
import { formatWeight, formatWeightValue, WEIGHT_UNIT_LABEL } from '@/utils/weight-unit'

interface Props {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  records: WeightRecord[]
  goal: Goal | null
  unit: WeightUnit
}

/**
 * 仪表盘分享海报：从仪表盘拆出，自行计算快照所需的派生数据，
 * 调用方只需传入基础数据与开关状态。
 */
export default function DashboardSharePoster({
  isOpen,
  onClose,
  profile,
  records,
  goal,
  unit,
}: Props) {
  const unitLabel = WEIGHT_UNIT_LABEL[unit]
  const currentWeight = getCurrentWeight(profile, records)
  const weeklyChange = getWeeklyChange(records)
  const isGainGoal = goal !== null && goal.targetWeight > goal.startWeight
  const goalLabel = goal ? (isGainGoal ? '增肌目标' : '减脂目标') : '体重目标'
  const progress = getGoalProgress(goal, currentWeight, records)

  // 当前 BMI 分级（快照）
  const currentBMI = getCurrentBMI(profile, records)
  const bmiRange = getBMIRange(getBMICategory(currentBMI))

  // 从首条记录到现在的累计变化（进步/变化，作为海报主角）
  const firstRecord = records[0]
  const totalDelta = getMetricStats(records).delta // 末次 - 首次，减重为负
  const recordCount = records.length
  // 坚持天数：首条记录到今天（含两端）
  const daysTracked = firstRecord ? dayjs().diff(dayjs(firstRecord.date), 'day') + 1 : 0
  // 至少两条且确有变化时，用累计变化做主角；否则回退到当前体重
  const hasShareProgress = recordCount >= 2 && totalDelta !== null && totalDelta !== 0

  // 累计变化的着色逻辑与本周变化一致（增肌目标下增重为正向）
  const deltaTone =
    totalDelta === null || totalDelta === 0
      ? 'text-[var(--carbon-text)]'
      : isGainGoal
        ? totalDelta > 0
          ? 'text-[var(--color-success)]'
          : 'text-[var(--color-danger)]'
        : totalDelta > 0
          ? 'text-[var(--color-danger)]'
          : 'text-[var(--color-success)]'

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

  return (
    <SharePosterModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 p-5 bg-[var(--carbon-bg)]">
        {/* 主角：累计变化（进步）；记录不足或无变化时回退为当前体重 */}
        {hasShareProgress && firstRecord && totalDelta !== null ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
              累计变化
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`text-[44px] font-semibold leading-none ${deltaTone}`}>
                {totalDelta > 0 ? '+' : ''}
                {formatWeightValue(totalDelta, unit)}
              </span>
              <span className="text-base text-[var(--carbon-text-secondary)]">{unitLabel}</span>
            </div>
            <p className="mt-2 text-xs text-[var(--carbon-text-secondary)]">
              起始 {formatWeightValue(firstRecord.weight, unit)} → 现在{' '}
              {formatWeightValue(currentWeight, unit)} {unitLabel} · 坚持 {daysTracked} 天 /{' '}
              {recordCount} 次记录
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
              当前体重
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[44px] font-semibold leading-none text-[var(--carbon-text)]">
                {formatWeightValue(currentWeight, unit)}
              </span>
              <span className="text-base text-[var(--carbon-text-secondary)]">{unitLabel}</span>
            </div>
          </div>
        )}

        {/* 快照条：当前体重（主角为进步时才补）+ BMI 分级 + 本周变化 */}
        <div className="flex items-center justify-between border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] px-4 py-3 rounded-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {hasShareProgress && (
              <span className="font-medium text-[var(--carbon-text)]">
                {formatWeight(currentWeight, unit)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[var(--carbon-text-secondary)]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: bmiRange.color }} />
              BMI {currentBMI} · {bmiRange.label}
            </span>
          </div>
          {weeklyChange !== null && (
            <span className={`text-sm font-semibold ${trendTone}`}>
              近7天 {formatWeight(weeklyChange, unit, { sign: true })}
            </span>
          )}
        </div>

        {/* 目标进度 */}
        {goal && progress && (
          <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4 rounded-sm">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--carbon-text-secondary)]">{goalLabel}</span>
              <span className="font-medium text-[var(--carbon-text)]">
                {progress.remaining === 0
                  ? '已达成！🎉'
                  : `还差 ${formatWeight(progress.remaining, unit)}`}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--carbon-surface-strong)]">
              <div
                className="h-full rounded-full bg-[var(--carbon-primary)]"
                style={{ width: `${progress.currentProgress}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-[var(--carbon-text-secondary)]">
              <span>目标 {formatWeight(goal.targetWeight, unit)}</span>
              <span>{progress.currentProgress}%</span>
            </div>
          </div>
        )}
      </div>
    </SharePosterModal>
  )
}
