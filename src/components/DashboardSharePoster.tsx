import dayjs from 'dayjs'
import { useI18n } from 'virtual:ai-i18n'

import SharePosterModal from '@/components/SharePosterModal'
import type { ActivityRecord, Goal, UserProfile, WeightRecord, WeightUnit } from '@/types'
import { getActivityDisplayName, getActivityWeekStats } from '@/utils/activity'
import { getBMICategory, getBMIRange } from '@/utils/bmi'
import {
  getCurrentBMI,
  getCurrentWeight,
  getGoalProgress,
  getMetricStats,
  getWeeklyChange,
} from '@/utils/stats'
import { formatWeight, formatWeightValue, getWeightUnitLabel } from '@/utils/weight-unit'

interface Props {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  records: WeightRecord[]
  activityRecords: ActivityRecord[]
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
  activityRecords,
  goal,
  unit,
}: Props) {
  const { t } = useI18n()
  const unitLabel = getWeightUnitLabel(unit)
  const currentWeight = getCurrentWeight(profile, records)
  const weeklyChange = getWeeklyChange(records)
  const isGainGoal = goal !== null && goal.targetWeight > goal.startWeight
  const goalLabel = goal ? (isGainGoal ? t('增肌目标') : t('减脂目标')) : t('体重目标')
  const progress = getGoalProgress(goal, currentWeight, records)
  const activityWeek = getActivityWeekStats(activityRecords)

  // 当前 BMI 分级（快照）
  const currentBMI = getCurrentBMI(profile, records)
  const bmiRange = getBMIRange(getBMICategory(currentBMI))
  const bmiLabel =
    bmiRange.label === '偏瘦'
      ? t('偏瘦')
      : bmiRange.label === '正常'
        ? t('正常')
        : bmiRange.label === '偏胖'
          ? t('偏胖')
          : t('肥胖')

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
              {t('累计变化')}
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`text-[44px] font-semibold leading-none ${deltaTone}`}>
                {totalDelta > 0 ? '+' : ''}
                {formatWeightValue(totalDelta, unit)}
              </span>
              <span className="text-base text-[var(--carbon-text-secondary)]">{unitLabel}</span>
            </div>
            <p className="mt-2 text-xs text-[var(--carbon-text-secondary)]">
              {t`起始 ${formatWeightValue(firstRecord.weight, unit)} → 现在 ${formatWeightValue(currentWeight, unit)} ${unitLabel} · 坚持 ${daysTracked} 天 / ${recordCount} 次记录`}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
              {t('当前体重')}
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
              BMI {currentBMI} · {bmiLabel}
            </span>
          </div>
          {weeklyChange !== null && (
            <span className={`text-sm font-semibold ${trendTone}`}>
              {t`近7天 ${formatWeight(weeklyChange, unit, { sign: true })}`}
            </span>
          )}
        </div>

        {/* 本周运动：只展示汇总和类型，不带出可能含隐私的备注 */}
        {activityWeek.sessions > 0 && (
          <div className="overflow-hidden border border-[#2f392e] bg-[#171c18] px-4 py-4 text-[#f7faef]">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c7f36b]">
                  {t('本周运动节律')}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[30px] font-black leading-none">
                    {activityWeek.activeDays}
                  </span>
                  <span className="text-xs font-semibold text-[#b9c2b5]">{t('天运动')}</span>
                </div>
              </div>
              <p className="text-right text-sm font-bold">
                {t`${activityWeek.sessions} 次`}
                <span className="ml-2 text-xs font-medium text-[#b9c2b5]">
                  {t`${activityWeek.totalMinutes} 分钟`}
                </span>
              </p>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {activityWeek.days.map((day, index) => (
                <div key={day.date} className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-semibold text-[#8f9a8c]">
                    {[t('一'), t('二'), t('三'), t('四'), t('五'), t('六'), t('日')][index]}
                  </span>
                  <span
                    className={`h-1.5 w-full ${day.active ? 'bg-[#c7f36b]' : 'bg-[#343d34]'}`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-[#2f392e] pt-3">
              {activityWeek.typeBreakdown.slice(0, 3).map(type => (
                <span
                  key={type.name}
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#d8ded4]"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  {t`${getActivityDisplayName(type.name)} ${type.sessions} 次`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 目标进度 */}
        {goal && progress && (
          <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4 rounded-sm">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--carbon-text-secondary)]">{goalLabel}</span>
              <span className="font-medium text-[var(--carbon-text)]">
                {progress.remaining === 0
                  ? t('已达成！🎉')
                  : t`还差 ${formatWeight(progress.remaining, unit)}`}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--carbon-surface-strong)]">
              <div
                className="h-full rounded-full bg-[var(--carbon-primary)]"
                style={{ width: `${progress.currentProgress}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-[var(--carbon-text-secondary)]">
              <span>{t`目标 ${formatWeight(goal.targetWeight, unit)}`}</span>
              <span>{progress.currentProgress}%</span>
            </div>
          </div>
        )}
      </div>
    </SharePosterModal>
  )
}
