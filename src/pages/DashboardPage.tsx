import WeightTrendChart from '@/components/WeightTrendChart'
import type { AppPage, Goal, UserProfile, WeightRecord } from '@/types'
import { getProfileAge, hasBirthDateMigrationNeeded } from '@/utils/age'
import { calculateMetabolismStats } from '@/utils/metabolism'
import {
  filterRecordsByDays,
  getCurrentWeight,
  getGoalProgress,
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
  const currentWeight = getCurrentWeight(profile, records)
  const previousDiff = getPreviousDiff(records)
  const weeklyRecords = filterRecordsByDays(records, 7)
  const weeklyChange = getWeeklyChange(records)
  const progress = getGoalProgress(goal, currentWeight, records)
  const hasRecords = records.length > 0
  const isGainGoal = goal !== null && goal.targetWeight > goal.startWeight
  const goalLabel = goal ? (isGainGoal ? '增肌目标' : '减脂目标') : '体重目标'

  // Calculate Metabolism
  const metabolism = calculateMetabolismStats(profile, records, 7)

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

  return (
    <div className="app-page bg-[var(--carbon-bg)]">
      <main className="app-main flex flex-col gap-4 px-4 pb-8 pt-4">
        {hasBirthDateMigrationNeeded(profile) && (
          <div className="relative flex items-start justify-between overflow-hidden rounded-sm border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-3 text-sm shadow-sm">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-[var(--color-warning)]" />
            <span className="pl-1 leading-relaxed text-[var(--carbon-text-secondary)]">
              我们升级了年龄记录方式，请
              <span className="font-medium text-[var(--carbon-text)]">重新设置出生日期</span>
              以保持计算准确。
            </span>
            <button
              onClick={() => onNavigate('profile')}
              className="mt-0.5 shrink-0 whitespace-nowrap font-medium text-[var(--carbon-primary)] hover:underline"
            >
              去更新
            </button>
          </div>
        )}

        {!hasBirthDateMigrationNeeded(profile) &&
          getProfileAge(profile) === undefined &&
          !metabolism.isDataSufficient && (
            <div className="flex items-center justify-between bg-[var(--carbon-primary-soft)] border border-[var(--carbon-primary)] px-4 py-3 text-sm text-[var(--carbon-text)] rounded-sm">
              <span>补充出生日期以解锁每日代谢(TDEE)追踪</span>
              <button
                onClick={() => onNavigate('profile')}
                className="font-medium text-[var(--carbon-primary)] hover:underline whitespace-nowrap ml-4 shrink-0"
              >
                去设置
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
                  previousDiff !== null && previousDiff > 0
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
                  <div className="mt-1 flex items-start gap-1.5 rounded bg-[var(--carbon-surface-subtle)] p-2">
                    <span className="i-lucide-info h-3 w-3 mt-0.5 shrink-0 text-[var(--carbon-text-secondary)]" />
                    <p className="text-[11px] leading-relaxed text-[var(--carbon-text-secondary)]">
                      基于最近 {metabolism.trendDays} 天趋势推算。
                      {metabolism.tdeeTrend < 0
                        ? '你正处于热量赤字状态，干得漂亮！'
                        : metabolism.tdeeTrend > 0
                          ? '你正处于热量盈余状态。'
                          : '你的摄入与消耗完全平衡。'}
                    </p>
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
            className="flex min-w-[200px] items-center justify-center gap-3 bg-[var(--carbon-primary)] px-6 py-3.5 text-sm font-semibold text-[var(--carbon-text-on-primary)] shadow-sm transition-colors hover:bg-[var(--carbon-primary-hover)] rounded-sm"
          >
            <span className="i-lucide-plus h-4 w-4" />
            <span>添加今日记录</span>
          </button>
        </section>
      </main>
    </div>
  )
}
