import { useMemo, useState } from 'react'

import WeightTrendChart from '../components/WeightTrendChart'
import type { AppTab, TimeRange, WeightRecord } from '../types'
import { buildTrendInsight, filterRecordsByRange, getWeightStats } from '../utils/stats'

const RANGE_OPTIONS = [
  { key: '3d', label: '3天' },
  { key: '7d', label: '7天' },
  { key: '15d', label: '半月' },
  { key: '1m', label: '1个月' },
  { key: '3m', label: '3个月' },
  { key: '6m', label: '半年' },
] as const

interface Props {
  records: WeightRecord[]
  onNavigate: (tab: AppTab) => void
}

export default function TrendsPage({ records, onNavigate }: Props) {
  const [range, setRange] = useState<TimeRange>('7d')
  const filteredRecords = useMemo(() => filterRecordsByRange(records, range), [range, records])
  const stats = getWeightStats(filteredRecords)
  const insight = buildTrendInsight(filteredRecords)
  const hasRecords = records.length > 0
  const hasChartData = filteredRecords.length > 0

  return (
    <div className="app-page bg-[var(--carbon-bg)]">
      <main className="app-main px-4">
        <div className="mb-4">
          <h2 className="text-2xl font-normal text-[var(--carbon-text)]">体重趋势</h2>
          <p className="mt-1 text-sm text-[var(--carbon-text-secondary)]">直观查看您的进度</p>
        </div>

        <div className="mb-4 flex gap-1 overflow-x-auto border-b border-[var(--carbon-border)] carbon-scrollbar pb-px">
          {RANGE_OPTIONS.map(option => {
            const isActive = option.key === range
            return (
              <button
                key={option.key}
                onClick={() => setRange(option.key)}
                className={`shrink-0 whitespace-nowrap px-4 border-b-2 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary)] text-[var(--carbon-text-on-primary)]'
                    : 'border-transparent text-[var(--carbon-text-secondary)] hover:bg-[var(--carbon-surface-variant)]'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        {hasChartData ? (
          <>
            <WeightTrendChart records={filteredRecords} />

            <section className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-[var(--carbon-border)] bg-[var(--carbon-border)]">
              <div className="bg-[var(--carbon-surface)] p-4">
                <span className="text-xs text-[var(--carbon-text-secondary)]">最高</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-light text-[var(--carbon-text)]">
                    {stats.max ?? '--'}
                  </span>
                  <span className="text-xs text-[var(--carbon-text-secondary)]">kg</span>
                </div>
              </div>
              <div className="bg-[var(--carbon-surface)] p-4">
                <span className="text-xs text-[var(--carbon-text-secondary)]">最低</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-light text-[var(--carbon-text)]">
                    {stats.min ?? '--'}
                  </span>
                  <span className="text-xs text-[var(--carbon-text-secondary)]">kg</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between bg-[var(--carbon-surface)] p-4">
                <div>
                  <span className="text-xs text-[var(--carbon-text-secondary)]">平均体重</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-light text-[var(--carbon-primary)]">
                      {stats.average ?? '--'}
                    </span>
                    <span className="text-sm text-[var(--carbon-text-secondary)]">kg</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)]">
                  <span className="i-lucide-chart-column h-6 w-6" />
                </div>
              </div>
            </section>

            <section className="mt-4 flex gap-4 border-l-4 border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] px-4 py-4">
              <span className="i-lucide-lightbulb h-5 w-5 shrink-0 text-[var(--carbon-primary)]" />
              <div>
                <h4 className="text-xs font-bold text-[var(--carbon-text)]">洞察</h4>
                <p className="mt-1 text-sm leading-6 text-[var(--carbon-text-secondary)]">
                  {insight}
                </p>
              </div>
            </section>
          </>
        ) : (
          <section className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--carbon-text-secondary)]">
                {hasRecords ? '当前区间无数据' : '暂无趋势数据'}
              </p>
              <p className="text-lg font-light text-[var(--carbon-text)]">
                {hasRecords ? '这个时间范围内还没有记录' : '先保存第一条体重记录，再回来查看趋势'}
              </p>
              <p className="text-sm leading-6 text-[var(--carbon-text-secondary)]">
                {hasRecords
                  ? '可以切换到其他时间范围，或者继续添加更多记录。'
                  : '趋势页会在你开始记录后展示折线、区间统计和洞察信息。'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('add')}
              className="mt-4 flex h-12 items-center justify-center bg-[var(--carbon-primary)] px-5 text-sm font-medium text-[var(--carbon-text-on-primary)] hover:bg-[var(--carbon-primary-hover)]"
            >
              去添加记录
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
