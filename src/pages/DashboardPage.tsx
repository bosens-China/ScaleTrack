import dayjs from 'dayjs'
import { useState } from 'react'

import DashboardMetabolismCard from '@/components/DashboardMetabolismCard'
import DashboardSharePoster from '@/components/DashboardSharePoster'
import WeightTrendChart from '@/components/WeightTrendChart'
import { useWeightUnit } from '@/hooks/weight-unit-context'
import type { AppPage, Goal, UserProfile, WeightRecord } from '@/types'
import { isGoalOverdue } from '@/utils/goal-state'
import { calculateMetabolismStats } from '@/utils/metabolism'
import {
  filterRecordsByDays,
  getCurrentWeight,
  getGoalProgress,
  getPreviousDiff,
} from '@/utils/stats'
import { calculateStreak } from '@/utils/streak'
import { formatWeight, formatWeightValue, WEIGHT_UNIT_LABEL } from '@/utils/weight-unit'

interface Props {
  profile: UserProfile
  records: WeightRecord[]
  goal: Goal | null
  onNavigate: (page: AppPage) => void
  onDeleteRecord: (id: string) => void
}

export default function DashboardPage({ profile, records, goal, onNavigate }: Props) {
  const [isShareOpen, setIsShareOpen] = useState(false)
  const { unit } = useWeightUnit()
  const unitLabel = WEIGHT_UNIT_LABEL[unit]

  const currentWeight = getCurrentWeight(profile, records)
  const previousDiff = getPreviousDiff(records)
  const weeklyRecords = filterRecordsByDays(records, 7)
  const progress = getGoalProgress(goal, currentWeight, records)
  const hasRecords = records.length > 0
  const todayStr = dayjs().format('YYYY-MM-DD')
  const hasTodayRecord = records.some(r => r.date === todayStr)
  const isGainGoal = goal !== null && goal.targetWeight > goal.startWeight
  const goalLabel = goal ? (isGainGoal ? '增肌目标' : '减脂目标') : '体重目标'

  // 代谢趋势只看最近 30 天，避免历史平台期/早期快速变化稀释当前速率
  const metabolism = calculateMetabolismStats(profile, filterRecordsByDays(records, 30), 7)

  // 距用户设定的目标日期还有多少天（未设置或已达成则为 null）
  const daysUntilTarget =
    goal?.targetDate && progress && progress.remaining > 0
      ? dayjs(goal.targetDate).diff(dayjs(todayStr), 'day')
      : null
  const goalOverdue = isGoalOverdue(goal, todayStr) && (progress?.remaining ?? 0) > 0
  const streak = calculateStreak(records, todayStr)

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
        {/* 今日未记录的轻提醒：已有历史记录但今天还没打卡时出现，引导快速补录 */}
        {hasRecords && !hasTodayRecord && (
          <button
            onClick={() => onNavigate('add')}
            className="flex items-center justify-between gap-3 rounded-sm border border-[var(--carbon-border)] bg-[var(--carbon-primary-soft)] px-4 py-3 text-left transition-colors hover:bg-[var(--carbon-surface-hover)]"
          >
            <span className="flex items-center gap-2 text-sm text-[var(--carbon-text)]">
              <span className="i-lucide-calendar-plus h-4 w-4 shrink-0 text-[var(--carbon-primary)]" />
              今天还没有记录体重
            </span>
            <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-[var(--carbon-primary)]">
              去记录
              <span className="i-lucide-chevron-right h-3.5 w-3.5" />
            </span>
          </button>
        )}

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
                  {formatWeightValue(currentWeight, unit)}
                </span>
                <span className="text-base opacity-90">{unitLabel}</span>
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
                  : formatWeight(previousDiff, unit, { sign: true, withSpace: false })}
              </span>
            </div>
          </div>
        </section>

        {hasRecords ? (
          <>
            <section className="flex flex-col gap-2">
              <div className="flex items-end justify-between px-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[var(--carbon-text)]">最近进度</h2>
                  {streak.current > 0 && (
                    <span
                      className="flex items-center gap-1 rounded-full bg-[var(--carbon-primary-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--carbon-primary)]"
                      title={`最长连续 ${streak.longest} 天`}
                    >
                      <span className="i-lucide-flame h-3 w-3" />
                      连续 {streak.current} 天
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onNavigate('trends')}
                  className="text-xs font-medium text-[var(--carbon-primary)] hover:underline"
                >
                  更多趋势
                </button>
              </div>
              <WeightTrendChart records={weeklyRecords} unit={unit} />
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
                  {goal ? formatWeight(goal.targetWeight, unit) : '未设置'}
                </p>
                {progress && (
                  <p className="text-xs text-[var(--carbon-text-secondary)]">
                    {progress.remaining === 0
                      ? '已达成目标'
                      : `还差 ${formatWeight(progress.remaining, unit)}`}
                  </p>
                )}
              </div>
              {goal?.targetDate && (
                <p
                  className={`mt-1.5 flex items-center gap-1 text-[11px] ${goalOverdue ? 'text-[var(--color-warning)]' : 'text-[var(--carbon-text-secondary)]'}`}
                >
                  <span className="i-lucide-calendar-clock h-3 w-3" />
                  {dayjs(goal.targetDate).format('YYYY/MM/DD')} 达成
                  {daysUntilTarget !== null &&
                    (daysUntilTarget > 0 ? ` · 剩 ${daysUntilTarget} 天` : ' · 已到期')}
                </p>
              )}
              {goalOverdue && (
                <div className="mt-2 flex items-center justify-between border-l-2 border-[var(--color-warning)] bg-[var(--carbon-surface-subtle)] px-3 py-2">
                  <span className="text-[11px] leading-4 text-[var(--carbon-text-secondary)]">
                    目标日期已过仍未达成，去延期或重设目标？
                  </span>
                  <button
                    onClick={() => onNavigate('profile')}
                    className="ml-2 shrink-0 whitespace-nowrap text-[11px] font-medium text-[var(--carbon-primary)] hover:underline"
                  >
                    去调整
                  </button>
                </div>
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

            <DashboardMetabolismCard
              metabolism={metabolism}
              records={records}
              goal={goal}
              progress={progress}
              currentWeight={currentWeight}
              unit={unit}
            />
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

      <DashboardSharePoster
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profile={profile}
        records={records}
        goal={goal}
        unit={unit}
      />
    </div>
  )
}
