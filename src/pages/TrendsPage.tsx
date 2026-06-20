import dayjs from 'dayjs'
import { useState } from 'react'

import TextInput from '@/components/TextInput'
import WeightTrendChart from '@/components/WeightTrendChart'
import { useWeightUnit } from '@/hooks/weight-unit-context'
import type { AppPage, Goal, TimeRange, WeightRecord } from '@/types'
import {
  buildTrendInsight,
  filterRecordsByRange,
  getMetricStats,
  type TrendMetric,
} from '@/utils/stats'
import { toast } from '@/utils/toast'
import { validateWeight } from '@/utils/validation'
import {
  formatWeight,
  formatWeightValue,
  fromDisplayWeight,
  toDisplayWeight,
  WEIGHT_UNIT_LABEL,
} from '@/utils/weight-unit'

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
  goal: Goal | null
  onNavigate: (page: AppPage) => void
  onUpdateRecord: (id: string, patch: { weight?: number; note?: string }) => void
  onDeleteRecord: (id: string) => void
}

export default function TrendsPage({
  records,
  goal,
  onNavigate,
  onUpdateRecord,
  onDeleteRecord,
}: Props) {
  const { unit } = useWeightUnit()
  const [range, setRange] = useState<TimeRange>('7d')
  const [metric, setMetric] = useState<TrendMetric>('weight')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editWeight, setEditWeight] = useState('')
  const [editNote, setEditNote] = useState('')

  const filteredRecords = filterRecordsByRange(records, range)
  const stats = getMetricStats(filteredRecords, metric)
  const insight = buildTrendInsight(filteredRecords, metric, unit)
  const hasRecords = records.length > 0
  const hasChartData = filteredRecords.length > 0
  const metricUnit = metric === 'weight' ? WEIGHT_UNIT_LABEL[unit] : ''
  const averageLabel = metric === 'weight' ? '平均体重' : '平均 BMI'
  // 体重指标下，统计值需按单位换算展示；BMI 指标保持原值
  const fmtStat = (value: number | null) =>
    value === null ? '--' : metric === 'weight' ? formatWeightValue(value, unit) : value
  const pageTitle = metric === 'weight' ? '体重趋势' : 'BMI 趋势'
  const pageDescription = metric === 'weight' ? '直观查看您的进度' : '观察 BMI 变化与身体状态走势'

  const isGainGoal = goal !== null && goal.targetWeight > goal.startWeight
  const recentRecords = [...records].reverse()

  const handleDeleteClick = (id: string) => {
    setEditingId(null)
    setPendingDeleteId(id)
  }

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDeleteRecord(pendingDeleteId)
      setPendingDeleteId(null)
    }
  }

  const handleEditClick = (record: WeightRecord) => {
    setPendingDeleteId(null)
    setEditingId(record.id)
    setEditWeight(formatWeightValue(record.weight, unit))
    setEditNote(record.note ?? '')
  }

  const handleConfirmEdit = (id: string) => {
    const parsedDisplay = Number.parseFloat(editWeight)
    const parsed = fromDisplayWeight(parsedDisplay, unit)
    if (Number.isNaN(parsedDisplay) || !validateWeight(parsed)) {
      toast.error('请输入有效的体重')
      return
    }
    onUpdateRecord(id, { weight: parsed, note: editNote.trim() })
    setEditingId(null)
  }

  return (
    <div className="app-page bg-[var(--carbon-bg)] animate-fade-in">
      <main className="app-main px-4 pb-8 pt-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-normal text-[var(--carbon-text)]">{pageTitle}</h2>
            <p className="mt-1 text-sm text-[var(--carbon-text-secondary)]">{pageDescription}</p>
          </div>
          {hasRecords && (
            <div className="flex bg-[var(--carbon-surface-subtle)] border border-[var(--carbon-border)] rounded-sm overflow-hidden p-0.5">
              <button
                onClick={() => setMetric('weight')}
                className={`px-3 py-1 text-xs font-medium transition-all duration-200 rounded-[2px] active:scale-95 ${
                  metric === 'weight'
                    ? 'bg-[var(--carbon-bg)] text-[var(--carbon-text)] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]'
                }`}
              >
                体重
              </button>
              <button
                onClick={() => setMetric('bmi')}
                className={`px-3 py-1 text-xs font-medium transition-all duration-200 rounded-[2px] active:scale-95 ${
                  metric === 'bmi'
                    ? 'bg-[var(--carbon-bg)] text-[var(--carbon-text)] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]'
                }`}
              >
                BMI
              </button>
            </div>
          )}
        </div>

        <div className="mb-4 flex gap-1 overflow-x-auto border-b border-[var(--carbon-border)] carbon-scrollbar pb-px">
          {RANGE_OPTIONS.map(option => {
            const isActive = option.key === range
            return (
              <button
                key={option.key}
                onClick={() => setRange(option.key)}
                className={`shrink-0 whitespace-nowrap px-4 border-b-2 py-2.5 text-sm transition-colors active:scale-95 ${
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
            <WeightTrendChart
              records={filteredRecords}
              metric={metric}
              goalWeight={goal?.targetWeight}
              unit={unit}
            />

            <section className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-[var(--carbon-border)] bg-[var(--carbon-border)]">
              <div className="bg-[var(--carbon-surface)] p-4">
                <span className="text-xs text-[var(--carbon-text-secondary)]">最高</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-light text-[var(--carbon-text)]">
                    {fmtStat(stats.max)}
                  </span>
                  {metricUnit && (
                    <span className="text-xs text-[var(--carbon-text-secondary)]">
                      {metricUnit}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-[var(--carbon-surface)] p-4">
                <span className="text-xs text-[var(--carbon-text-secondary)]">最低</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-light text-[var(--carbon-text)]">
                    {fmtStat(stats.min)}
                  </span>
                  {metricUnit && (
                    <span className="text-xs text-[var(--carbon-text-secondary)]">
                      {metricUnit}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between bg-[var(--carbon-surface)] p-4">
                <div>
                  <span className="text-xs text-[var(--carbon-text-secondary)]">
                    {averageLabel}
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-light text-[var(--carbon-primary)]">
                      {fmtStat(stats.average)}
                    </span>
                    {metricUnit && (
                      <span className="text-sm text-[var(--carbon-text-secondary)]">
                        {metricUnit}
                      </span>
                    )}
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
              className="mt-4 flex h-12 items-center justify-center bg-[var(--carbon-primary)] px-5 text-sm font-medium text-[var(--carbon-text-on-primary)] hover:bg-[var(--carbon-primary-hover)] active:scale-[0.98] transition-transform rounded-sm"
            >
              去添加记录
            </button>
          </section>
        )}

        {hasRecords && (
          <section className="mt-6 border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--carbon-border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="i-lucide-list h-4 w-4 text-[var(--carbon-primary)]" />
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--carbon-text-secondary)]">
                  所有记录
                </span>
              </div>
              <p className="text-xs font-medium text-[var(--carbon-text)]">
                共 {records.length} 条
              </p>
            </div>

            <div className="flex flex-col">
              {recentRecords.map((record, index) => {
                const prevRecord = recentRecords[index + 1]
                const isFirstRecord = record.id === records[0]?.id

                let diffTone = 'text-[var(--carbon-text-secondary)]'
                let diffIcon = 'i-lucide-minus'
                let diffText = ''

                if (prevRecord) {
                  const diff = record.weight - prevRecord.weight
                  const dispDiff = toDisplayWeight(diff, unit)
                  if (diff > 0) {
                    diffTone = isGainGoal
                      ? 'text-[var(--color-success)]'
                      : 'text-[var(--color-danger)]'
                    diffIcon = 'i-lucide-trending-up'
                    diffText = `+${dispDiff.toFixed(1)}`
                  } else if (diff < 0) {
                    diffTone = isGainGoal
                      ? 'text-[var(--color-danger)]'
                      : 'text-[var(--color-success)]'
                    diffIcon = 'i-lucide-trending-down'
                    diffText = `${dispDiff.toFixed(1)}`
                  } else {
                    diffText = '持平'
                  }
                }

                const isEditing = editingId === record.id

                return (
                  <div
                    key={record.id}
                    className="flex flex-col border-b border-[var(--carbon-border)] last:border-b-0"
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--carbon-text)]">
                            {formatWeight(record.weight, unit)}
                          </span>
                          {prevRecord && (
                            <span className={`flex items-center gap-0.5 text-[11px] ${diffTone}`}>
                              {diffText !== '持平' && <span className={`${diffIcon} h-3 w-3`} />}
                              <span>{diffText}</span>
                            </span>
                          )}
                          {isFirstRecord && !record.note && (
                            <span className="rounded-sm bg-[var(--carbon-primary-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--carbon-primary)]">
                              初始体重
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-[var(--carbon-text-secondary)]">
                          {dayjs(record.date).format('YYYY年MM月DD日')}
                          {record.note ? ` · ${record.note}` : ''}
                        </p>
                      </div>
                      <div className="ml-3 flex shrink-0 items-center">
                        <button
                          onClick={() => (isEditing ? setEditingId(null) : handleEditClick(record))}
                          className={`flex h-8 w-8 items-center justify-center transition-colors hover:text-[var(--carbon-primary)] ${isEditing ? 'text-[var(--carbon-primary)]' : 'text-[var(--carbon-outline)]'}`}
                          aria-label="编辑记录"
                        >
                          <span className="i-lucide-pencil h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(record.id)}
                          className="flex h-8 w-8 items-center justify-center text-[var(--carbon-outline)] transition-colors hover:text-[var(--color-danger)]"
                          aria-label="删除记录"
                        >
                          <span className="i-lucide-trash-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex flex-col gap-3 border-t border-[var(--carbon-primary)] bg-[var(--carbon-surface-subtle)] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TextInput
                            type="number"
                            inputMode="decimal"
                            value={editWeight}
                            onChange={event => setEditWeight(event.target.value)}
                            wrapperClassName="flex-1 !h-10"
                            placeholder={`体重（${WEIGHT_UNIT_LABEL[unit]}）`}
                          />
                          <button
                            onClick={() => handleConfirmEdit(record.id)}
                            className="flex h-10 shrink-0 items-center justify-center bg-[var(--carbon-primary)] px-4 text-xs font-medium text-[var(--carbon-text-on-primary)] hover:bg-[var(--carbon-primary-hover)]"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex h-10 shrink-0 items-center justify-center px-3 text-xs text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]"
                          >
                            取消
                          </button>
                        </div>
                        <TextInput
                          type="text"
                          value={editNote}
                          onChange={event => setEditNote(event.target.value)}
                          placeholder="备注（选填）"
                          wrapperClassName="!h-10"
                        />
                      </div>
                    )}
                    {pendingDeleteId === record.id && (
                      <div className="flex items-center justify-between border-t border-[var(--color-danger)] bg-[var(--carbon-surface-subtle)] px-4 py-2.5">
                        <p className="text-xs text-[var(--carbon-text-secondary)]">
                          确认删除这条记录？
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPendingDeleteId(null)}
                            className="px-3 py-1 text-xs text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]"
                          >
                            取消
                          </button>
                          <button
                            onClick={handleConfirmDelete}
                            className="bg-[var(--color-danger)] px-3 py-1 text-xs font-medium text-white"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
