import dayjs from 'dayjs'

import type { AppTab, Goal, UserProfile, WeightRecord } from '../types'
import { getBMICategory, getBMIColor } from '../utils/bmi'
import {
  filterRecordsByDays,
  getCurrentBMI,
  getCurrentWeight,
  getGoalProgress,
  getPreviousDiff,
  getSmoothedWeight,
  getWeeklyChange,
} from '../utils/stats'

interface Props {
  profile: UserProfile
  records: WeightRecord[]
  goal: Goal | null
  onNavigate: (tab: AppTab) => void
  onDeleteRecord: (id: string) => void
}

function buildSparklinePoints(records: WeightRecord[]) {
  if (records.length === 0) {
    return '0,32 100,32'
  }

  const weights = records.map(record => record.weight)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const range = Math.max(max - min, 0.1)

  return records
    .map((record, index) => {
      const x = records.length === 1 ? 50 : (index / (records.length - 1)) * 100
      const y = 35 - ((record.weight - min) / range) * 25
      return `${x},${y.toFixed(2)}`
    })
    .join(' ')
}

export default function DashboardPage({
  profile,
  records,
  goal,
  onNavigate,
  onDeleteRecord,
}: Props) {
  const currentWeight = getCurrentWeight(profile, records)
  const currentBMI = getCurrentBMI(profile, records)
  const latestRecord = records.at(-1)
  const previousDiff = getPreviousDiff(records)
  const weeklyRecords = filterRecordsByDays(records, 7)
  const weeklyChange = getWeeklyChange(records)
  const smoothedWeight = getSmoothedWeight(profile, records)
  const progress = getGoalProgress(profile.initialWeight, goal, smoothedWeight)
  const sparkline = buildSparklinePoints(weeklyRecords)
  const latestBmiTone = getBMIColor(currentBMI)
  const latestCategory = getBMICategory(currentBMI)
  const recentRecords = [...records].reverse().slice(0, 5)
  const hasRecords = records.length > 0
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
      : weeklyChange > 0
        ? 'text-[#da1e28]'
        : 'text-[#198038]'

  return (
    <div className="app-page bg-[var(--carbon-bg)]">
      <main className="app-main flex flex-col gap-4 px-4 pb-8 pt-4">
        <section className="bg-[var(--carbon-primary)] px-4 py-4 text-[var(--carbon-text-on-primary)] shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-72">当前体重</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-semibold leading-none">
                  {currentWeight.toFixed(1)}
                </span>
                <span className="text-sm opacity-90">kg</span>
              </div>
            </div>
            <div className="flex min-w-[72px] flex-col items-center bg-black/10 dark:bg-black/10 px-3 py-2 text-center">
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

          <div className="mt-4 flex items-center justify-between border-t border-[var(--carbon-text-on-primary)] border-opacity-10 pt-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-72">BMI</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xl font-semibold">{currentBMI.toFixed(1)}</span>
                <span
                  className="px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{ backgroundColor: '#ffffff', color: latestBmiTone }}
                >
                  {latestCategory === 'underweight'
                    ? '偏瘦'
                    : latestCategory === 'normal'
                      ? '正常'
                      : latestCategory === 'overweight'
                        ? '偏胖'
                        : '肥胖'}
                </span>
              </div>
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
                  7 天
                </button>
              </div>
              <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4 shadow-sm">
                <div className="h-24 w-full">
                  <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <polyline
                      points={sparkline}
                      fill="none"
                      stroke="var(--carbon-primary)"
                      strokeWidth="2"
                      strokeLinecap="square"
                    />
                    <linearGradient id="dashboard-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--carbon-primary)" stopOpacity="0.10" />
                      <stop offset="100%" stopColor="var(--carbon-primary)" stopOpacity="0" />
                    </linearGradient>
                    <polygon points={`${sparkline} 100,40 0,40`} fill="url(#dashboard-gradient)" />
                  </svg>
                </div>
                <div className="mt-1.5 flex justify-between border-t border-[var(--carbon-border)] pt-2 text-[11px] font-medium text-[var(--carbon-text-secondary)]">
                  {Array.from({ length: 7 }, (_, index) =>
                    dayjs()
                      .subtract(6 - index, 'day')
                      .format('dd'),
                  ).map(label => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4">
                <div className="flex items-center gap-2 text-[var(--carbon-text-secondary)]">
                  <span className="i-lucide-flag h-4 w-4" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em]">目标</span>
                </div>
                <p className="mt-3 text-xl font-semibold text-[var(--carbon-text)]">
                  {goal ? `${goal.targetWeight.toFixed(1)} kg` : '未设置'}
                </p>
                <div className="mt-3 h-1 bg-[var(--carbon-surface-strong)]">
                  <div
                    className="h-full bg-[var(--carbon-primary)] transition-all duration-300"
                    style={{ width: `${progress?.progress ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4">
                <div className="flex items-center gap-2 text-[var(--carbon-text-secondary)]">
                  <span className="i-lucide-scale h-4 w-4" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em]">
                    周变化
                  </span>
                </div>
                <p className={`mt-3 text-xl font-semibold ${trendTone}`}>
                  {weeklyChange === null
                    ? '--'
                    : `${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(1)} kg`}
                </p>
                <p className="mt-1 text-[10px] text-[var(--carbon-text-secondary)]">
                  {weeklyDirection}
                </p>
              </div>
            </section>

            <section className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
              <div className="flex items-center justify-between border-b border-[var(--carbon-border)] px-4 py-2.5">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--carbon-text-secondary)]">
                    最近记录
                  </p>
                  <p className="mt-1 text-sm text-[var(--carbon-text)]">共 {records.length} 条</p>
                </div>
                <button
                  onClick={() => onNavigate('add')}
                  className="text-xs font-medium text-[var(--carbon-primary)] hover:underline"
                >
                  更新
                </button>
              </div>

              <div className="flex flex-col">
                {recentRecords.map(record => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between border-b border-[var(--carbon-border)] px-4 py-3 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-[var(--carbon-text)]">
                        {record.weight.toFixed(1)} kg
                      </span>
                      <p className="mt-0.5 truncate text-xs text-[var(--carbon-text-secondary)]">
                        {dayjs(record.date).format('MM月DD日')}
                        {record.note ? ` · ${record.note}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="ml-3 flex h-8 w-8 items-center justify-center text-[var(--carbon-outline)] transition-colors hover:text-[#da1e28]"
                      aria-label="删除记录"
                    >
                      <span className="i-lucide-trash-2 h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--carbon-border)] px-4 py-3">
                <div className="border-l-4 border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] px-3 py-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--carbon-text-secondary)]">
                    备注
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--carbon-text)]">
                    {latestRecord?.note?.trim()
                      ? latestRecord.note
                      : '这条记录还没有备注。你可以在“添加”页补充晨起、饭后或运动后等上下文。'}
                  </p>
                </div>
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

        <section className="flex justify-center pt-1">
          <button
            onClick={() => onNavigate('add')}
            className="flex min-w-[200px] items-center justify-center gap-3 bg-[var(--carbon-primary)] px-6 py-3 text-sm font-semibold text-[var(--carbon-text-on-primary)] shadow-sm transition-colors hover:bg-[var(--carbon-primary-hover)]"
          >
            <span className="i-lucide-plus h-4 w-4" />
            <span>添加体重记录</span>
          </button>
        </section>
      </main>
    </div>
  )
}
