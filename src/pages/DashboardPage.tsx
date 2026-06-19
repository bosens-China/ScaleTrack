import dayjs from 'dayjs'
import { useState } from 'react'

import SharePosterModal from '@/components/SharePosterModal'
import WeightTrendChart from '@/components/WeightTrendChart'
import type { AppPage, Goal, UserProfile, WeightRecord } from '@/types'
import { getBMICategory, getBMIRange } from '@/utils/bmi'
import { calculateMetabolismStats } from '@/utils/metabolism'
import {
  filterRecordsByDays,
  getCurrentBMI,
  getCurrentWeight,
  getGoalProgress,
  getMetricStats,
  getPreviousDiff,
  getWeeklyChange,
} from '@/utils/stats'

interface Props {
  profile: UserProfile
  records: WeightRecord[]
  goal: Goal | null
  onNavigate: (page: AppPage) => void
  onDeleteRecord: (id: string) => void
}

export default function DashboardPage({ profile, records, goal, onNavigate }: Props) {
  const [isShareOpen, setIsShareOpen] = useState(false)

  const currentWeight = getCurrentWeight(profile, records)
  const previousDiff = getPreviousDiff(records)
  const weeklyRecords = filterRecordsByDays(records, 7)
  const weeklyChange = getWeeklyChange(records)
  const progress = getGoalProgress(goal, currentWeight, records)
  const hasRecords = records.length > 0
  const isGainGoal = goal !== null && goal.targetWeight > goal.startWeight
  const goalLabel = goal ? (isGainGoal ? '增肌目标' : '减脂目标') : '体重目标'

  // 代谢趋势只看最近 30 天，避免历史平台期/早期快速变化稀释当前速率
  const metabolism = calculateMetabolismStats(profile, filterRecordsByDays(records, 30), 7)

  // 分享海报用：当前 BMI 分级（快照）
  const currentBMI = getCurrentBMI(profile, records)
  const bmiRange = getBMIRange(getBMICategory(currentBMI))

  // 分享海报用：从首条记录到现在的累计变化（进步/变化，作为海报主角）
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

  const weeklyDirection =
    weeklyChange === null
      ? '暂无变化'
      : weeklyChange > 0
        ? '本周增加'
        : weeklyChange < 0
          ? '本周减少'
          : '本周持平'
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
  const todayStr = dayjs().format('YYYY-MM-DD')
  const daysUntilTarget =
    goal?.targetDate && progress && progress.remaining > 0
      ? dayjs(goal.targetDate).diff(dayjs(todayStr), 'day')
      : null

  // 基于近期代谢趋势预测的剩余达成天数
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
    targetDaysText = `按照近期表现，预计大约 ${predictedDays} 天可达成目标！`
    // 用户设了目标日期时，对比预测与剩余天数，给出领先/落后提示
    if (daysUntilTarget !== null) {
      if (daysUntilTarget <= 0) {
        targetDaysText += ' 目标日期已到，继续加油。'
      } else if (predictedDays <= daysUntilTarget) {
        targetDaysText += ` 距目标日期还有 ${daysUntilTarget} 天，进度领先于计划。`
      } else {
        targetDaysText += ` 距目标日期仅剩 ${daysUntilTarget} 天，需要再加把劲。`
      }
    }
  }

  return (
    <div className="app-page bg-[var(--carbon-bg)] animate-fade-in">
      <header className="flex w-full items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-lg font-semibold tracking-wide text-[var(--carbon-text)]">总览</h1>
        {hasRecords && (
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--carbon-surface)] text-[var(--carbon-text-secondary)] shadow-sm hover:text-[var(--carbon-primary)] transition-colors border border-[var(--carbon-border)]"
          >
            <span className="i-lucide-share h-4 w-4" />
          </button>
        )}
      </header>

      <main className="app-main flex flex-col gap-4 px-4 pb-8 pt-2">
        {profile.age !== undefined &&
          profile.birthDate === undefined &&
          !metabolism.isDataSufficient && (
            <div className="relative flex items-start justify-between overflow-hidden rounded-sm border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-3 text-sm shadow-sm">
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-[var(--carbon-primary)]" />
              <span className="pl-1 leading-relaxed text-[var(--carbon-text-secondary)]">
                我们升级了记录方式，请
                <span className="font-medium text-[var(--carbon-text)]">重新设置出生日期</span>
                以解锁精准的每日代谢追踪。
              </span>
              <button
                onClick={() => onNavigate('profile')}
                className="mt-0.5 shrink-0 whitespace-nowrap font-medium text-[var(--carbon-primary)] hover:underline ml-3"
              >
                去更新
              </button>
            </div>
          )}

        <section className="bg-[var(--dashboard-header-bg)] px-4 py-5 text-[var(--dashboard-header-text)] shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-72">当前体重</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[44px] font-semibold leading-none">
                  {currentWeight.toFixed(1)}
                </span>
                <span className="text-base opacity-90">kg</span>
              </div>
            </div>
            <div
              className="flex min-w-[72px] flex-col items-center px-3 py-2 text-center rounded-sm"
              style={{ backgroundColor: 'var(--dashboard-header-accent)' }}
            >
              <span
                className={`h-4 w-4 ${
                  previousDiff === null || previousDiff === 0
                    ? 'i-lucide-minus'
                    : previousDiff > 0
                      ? 'i-lucide-trending-up'
                      : 'i-lucide-trending-down'
                }`}
              />
              <span className="mt-1 text-[10px] font-bold">
                {previousDiff === null
                  ? '暂无对比'
                  : `${previousDiff > 0 ? '+' : ''}${previousDiff.toFixed(1)}kg`}
              </span>
            </div>
          </div>
        </section>

        {hasRecords ? (
          <>
            <section className="flex flex-col gap-2">
              <div className="flex items-end justify-between px-0.5">
                <h2 className="text-sm font-semibold text-[var(--carbon-text)]">最近进度</h2>
                <button
                  onClick={() => onNavigate('trends')}
                  className="text-xs font-medium text-[var(--carbon-primary)] hover:underline"
                >
                  更多趋势
                </button>
              </div>
              <WeightTrendChart records={weeklyRecords} />
            </section>

            <section className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4">
              <div className="flex items-center gap-2 text-[var(--carbon-text-secondary)]">
                <span className="i-lucide-flag h-4 w-4 text-[var(--carbon-primary)]" />
                <span className="text-[11px] font-medium uppercase tracking-[0.12em]">
                  {goalLabel}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-xl font-semibold text-[var(--carbon-text)]">
                  {goal ? `${goal.targetWeight.toFixed(1)} kg` : '未设置'}
                </p>
                {progress && (
                  <p className="text-xs text-[var(--carbon-text-secondary)]">
                    {progress.remaining === 0 ? '已达成目标' : `还差 ${progress.remaining} kg`}
                  </p>
                )}
              </div>
              {goal?.targetDate && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--carbon-text-secondary)]">
                  <span className="i-lucide-calendar-clock h-3 w-3" />
                  {dayjs(goal.targetDate).format('YYYY/MM/DD')} 达成
                  {daysUntilTarget !== null &&
                    (daysUntilTarget > 0 ? ` · 剩 ${daysUntilTarget} 天` : ' · 已到期')}
                </p>
              )}
              <div className="mt-3 flex h-1.5 w-full bg-[var(--carbon-surface-strong)] overflow-hidden rounded-full">
                {progress && (
                  <>
                    <div
                      className="h-full bg-[var(--carbon-primary)] transition-all duration-300"
                      style={{ width: `${progress.currentProgress}%` }}
                    />
                    {progress.progress > progress.currentProgress && (
                      <div
                        className="h-full bg-[var(--carbon-primary)] opacity-30 transition-all duration-300"
                        style={{ width: `${progress.progress - progress.currentProgress}%` }}
                      />
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4">
              <div className="flex items-center justify-between border-b border-[var(--carbon-border)] pb-3 mb-3">
                <div className="flex items-center gap-2 text-[var(--carbon-text-secondary)]">
                  <span className="i-lucide-activity h-4 w-4 text-[var(--carbon-primary)]" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em]">
                    近期身体表现
                  </span>
                </div>
                {weeklyChange !== null && (
                  <div className={`flex items-baseline gap-1 ${trendTone}`}>
                    <span className="text-sm font-semibold">
                      {weeklyChange > 0 ? '+' : ''}
                      {weeklyChange.toFixed(1)} kg
                    </span>
                    <span className="text-[10px]">({weeklyDirection})</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--carbon-text-secondary)]">
                    静态基础代谢 (BMR)
                  </span>
                  <span className="text-sm font-medium text-[var(--carbon-text)]">
                    {metabolism.bmr ? `${metabolism.bmr} kcal` : '需设置年龄'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--carbon-text-secondary)]">
                    日均热量盈亏 (趋势)
                  </span>
                  {metabolism.isDataSufficient && metabolism.tdeeTrend !== null ? (
                    <span
                      className={`text-sm font-semibold ${metabolism.tdeeTrend < 0 ? 'text-[var(--color-success)]' : metabolism.tdeeTrend > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--carbon-text)]'}`}
                    >
                      {metabolism.tdeeTrend > 0 ? '+' : ''}
                      {metabolism.tdeeTrend} kcal
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--carbon-text-secondary)]">
                      数据不足 (需7天以上)
                    </span>
                  )}
                </div>
                {metabolism.isDataSufficient && metabolism.tdeeTrend !== null && (
                  <div className="mt-1 flex items-start gap-1.5 rounded bg-[var(--carbon-surface-subtle)] p-3 border-l-2 border-[var(--carbon-primary)]">
                    <span className="i-lucide-lightbulb h-4 w-4 mt-0.5 shrink-0 text-[var(--carbon-primary)]" />
                    <div className="flex flex-col gap-1">
                      <p className="text-[12px] font-medium leading-relaxed text-[var(--carbon-text)]">
                        {metabolism.tdeeTrend < 0
                          ? '🔥 你正处于热量赤字状态，干得漂亮！'
                          : metabolism.tdeeTrend > 0
                            ? '📈 你正处于热量盈余状态。'
                            : '⚖️ 你的摄入与消耗完全平衡。'}
                      </p>
                      {targetDaysText && (
                        <p className="text-[11px] leading-relaxed text-[var(--carbon-text-secondary)]">
                          {targetDaysText}
                        </p>
                      )}
                      {!targetDaysText && progress && progress.remaining > 0 && (
                        <p className="text-[11px] leading-relaxed text-[var(--carbon-text-secondary)]">
                          保持当前节奏，适度调整饮食结构以{isGainGoal ? '增加' : '减少'}热量摄入。
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="flex flex-col gap-4 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--carbon-text-secondary)]">
                开始记录
              </p>
              <h2 className="text-2xl font-light text-[var(--carbon-text)]">还没有体重数据</h2>
              <p className="text-sm leading-6 text-[var(--carbon-text-secondary)]">
                先保存第一条体重记录，仪表盘会自动补齐趋势、周变化和最近记录信息。
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--carbon-border)] pt-3 text-sm text-[var(--carbon-text-secondary)]">
              <span>当前基础资料</span>
              <span>
                {profile.height} cm / {profile.gender === 'male' ? '男' : '女'}
              </span>
            </div>
          </section>
        )}

        <section className="flex justify-center pt-2">
          <button
            onClick={() => onNavigate('add')}
            className="flex min-w-[200px] items-center justify-center gap-3 bg-[var(--carbon-primary)] px-6 py-3.5 text-sm font-semibold text-[var(--carbon-text-on-primary)] shadow-sm transition-transform active:scale-[0.98] hover:bg-[var(--carbon-primary-hover)] rounded-sm"
          >
            <span className="i-lucide-plus h-4 w-4" />
            <span>添加今日记录</span>
          </button>
        </section>
      </main>

      <SharePosterModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)}>
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
                  {totalDelta.toFixed(1)}
                </span>
                <span className="text-base text-[var(--carbon-text-secondary)]">kg</span>
              </div>
              <p className="mt-2 text-xs text-[var(--carbon-text-secondary)]">
                起始 {firstRecord.weight.toFixed(1)} → 现在 {currentWeight.toFixed(1)} kg · 坚持{' '}
                {daysTracked} 天 / {recordCount} 次记录
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
                当前体重
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[44px] font-semibold leading-none text-[var(--carbon-text)]">
                  {currentWeight.toFixed(1)}
                </span>
                <span className="text-base text-[var(--carbon-text-secondary)]">kg</span>
              </div>
            </div>
          )}

          {/* 快照条：当前体重（主角为进步时才补）+ BMI 分级 + 本周变化 */}
          <div className="flex items-center justify-between border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] px-4 py-3 rounded-sm">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {hasShareProgress && (
                <span className="font-medium text-[var(--carbon-text)]">
                  {currentWeight.toFixed(1)} kg
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-[var(--carbon-text-secondary)]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: bmiRange.color }}
                />
                BMI {currentBMI} · {bmiRange.label}
              </span>
            </div>
            {weeklyChange !== null && (
              <span className={`text-sm font-semibold ${trendTone}`}>
                本周 {weeklyChange > 0 ? '+' : ''}
                {weeklyChange.toFixed(1)} kg
              </span>
            )}
          </div>

          {/* 目标进度 */}
          {goal && progress && (
            <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4 rounded-sm">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[var(--carbon-text-secondary)]">{goalLabel}</span>
                <span className="font-medium text-[var(--carbon-text)]">
                  {progress.remaining === 0 ? '已达成！🎉' : `还差 ${progress.remaining} kg`}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--carbon-surface-strong)]">
                <div
                  className="h-full rounded-full bg-[var(--carbon-primary)]"
                  style={{ width: `${progress.currentProgress}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-[var(--carbon-text-secondary)]">
                <span>目标 {goal.targetWeight} kg</span>
                <span>{progress.currentProgress}%</span>
              </div>
            </div>
          )}
        </div>
      </SharePosterModal>
    </div>
  )
}
