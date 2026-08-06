import dayjs from 'dayjs'
import { useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import SharePosterModal from '@/components/SharePosterModal'

import WeightTrendChart from '@/components/WeightTrendChart'
import { useWeightUnit } from '@/hooks/weight-unit-context'
import type { Goal, WeightRecord } from '@/types'
import { formatAppDate } from '@/utils/date-format'
import {
  formatWeight,
  formatWeightValue,
  getWeightUnitLabel,
  toDisplayWeight,
} from '@/utils/weight-unit'

interface Props {
  milestoneId: string | null
  milestones: Goal[]
  records: WeightRecord[]
  onBack: () => void
}

export default function MilestoneDetailPage({ milestoneId, milestones, records, onBack }: Props) {
  const { t } = useI18n()
  const [isShareOpen, setIsShareOpen] = useState(false)
  const { unit } = useWeightUnit()
  const unitLabel = getWeightUnitLabel(unit)
  const milestone = milestones.find(m => m.id === milestoneId)

  if (!milestone) {
    return (
      <div className="app-page bg-[var(--carbon-bg)] flex items-center justify-center">
        <p className="text-sm text-[var(--carbon-text-secondary)]">{t('未找到里程碑')}</p>
        <button onClick={onBack} className="mt-4 text-[var(--carbon-primary)] hover:underline">
          {t('返回')}
        </button>
      </div>
    )
  }

  // Filter records that belong to this milestone's timeframe
  const periodRecords = records.filter(r => {
    return (
      r.date >= milestone.startDate &&
      (!milestone.completedDate || r.date <= milestone.completedDate)
    )
  })

  const days = milestone.completedDate
    ? dayjs(milestone.completedDate).diff(dayjs(milestone.startDate), 'day') || 1
    : 1
  const diff = Math.abs(milestone.startWeight - milestone.targetWeight)
  const averagePerDay = (toDisplayWeight(diff, unit) / days).toFixed(2)
  const isLoss = milestone.startWeight > milestone.targetWeight
  const direction = isLoss ? t('减') : t('增')

  return (
    <div className="app-page relative bg-[var(--carbon-bg)] pb-8 overflow-y-auto carbon-scrollbar">
      <header className="app-header sticky top-0 z-10 flex w-full max-w-[430px] items-center justify-between border-b border-[var(--carbon-border)] bg-[var(--carbon-bg)] px-4">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center -ml-2 text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]"
        >
          <span className="i-lucide-chevron-left h-6 w-6" />
        </button>
        <h1 className="text-base font-medium text-[var(--carbon-text)]">{t('里程碑详情')}</h1>
        <button
          onClick={() => setIsShareOpen(true)}
          className="flex h-10 w-10 items-center justify-center -mr-2 text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-primary)]"
        >
          <span className="i-lucide-share h-5 w-5" />
        </button>
      </header>

      <main className="flex flex-col gap-6 px-4 pt-6">
        <section className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)]">
            <span className="i-lucide-trophy h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--carbon-text)]">
            {formatWeightValue(milestone.startWeight, unit)}{' '}
            <span className="mx-2 text-[var(--carbon-outline)]">-&gt;</span>{' '}
            {formatWeightValue(milestone.targetWeight, unit)} {unitLabel}
          </h2>
          <p className="mt-1 text-sm text-[var(--carbon-text-secondary)]">
            {dayjs(milestone.startDate).format('YYYY/MM/DD')} -{' '}
            {milestone.completedDate
              ? dayjs(milestone.completedDate).format('YYYY/MM/DD')
              : t('至今')}
          </p>
        </section>

        <section className="grid grid-cols-3 gap-4 border-y border-[var(--carbon-border)] py-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--carbon-text-secondary)]">
              {t`总 ${direction} 重`}
            </span>
            <span className="mt-1 text-lg font-semibold text-[var(--carbon-text)]">
              {formatWeightValue(diff, unit)}{' '}
              <span className="text-[10px] font-normal">{unitLabel}</span>
            </span>
          </div>
          <div className="flex flex-col items-center border-l border-r border-[var(--carbon-border)]">
            <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--carbon-text-secondary)]">
              {t('共计用时')}
            </span>
            <span className="mt-1 text-lg font-semibold text-[var(--carbon-text)]">
              {days} <span className="text-[10px] font-normal">{t('天')}</span>
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--carbon-text-secondary)]">
              {t('日均变化')}
            </span>
            <span className="mt-1 text-lg font-semibold text-[var(--carbon-text)]">
              {averagePerDay} <span className="text-[10px] font-normal">{t`${unitLabel}/天`}</span>
            </span>
          </div>
        </section>

        {periodRecords.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-[var(--carbon-text)]">{t('阶段进度')}</h3>
            <WeightTrendChart records={periodRecords} />
          </section>
        )}

        <section className="flex flex-col">
          <h3 className="mb-2 text-sm font-semibold text-[var(--carbon-text)]">
            {t`详细记录 (${periodRecords.length})`}
          </h3>
          <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] flex flex-col">
            {[...periodRecords].reverse().map((record, index, arr) => {
              const prevRecord = arr[index + 1]
              let diffTone = 'text-[var(--carbon-text-secondary)]'
              let diffIcon = 'i-lucide-minus'
              let diffText = ''

              if (prevRecord) {
                const rDiff = record.weight - prevRecord.weight
                const dispDiff = toDisplayWeight(rDiff, unit)
                if (rDiff > 0) {
                  diffTone = isLoss ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'
                  diffIcon = 'i-lucide-trending-up'
                  diffText = `+${dispDiff.toFixed(1)}`
                } else if (rDiff < 0) {
                  diffTone = isLoss ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                  diffIcon = 'i-lucide-trending-down'
                  diffText = `${dispDiff.toFixed(1)}`
                } else {
                  diffText = t('持平')
                }
              }

              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between border-b border-[var(--carbon-border)] px-4 py-3 last:border-b-0"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--carbon-text)]">
                        {formatWeight(record.weight, unit)}
                      </span>
                      {prevRecord && (
                        <span className={`flex items-center gap-0.5 text-[11px] ${diffTone}`}>
                          {diffText !== t('持平') && <span className={`${diffIcon} h-3 w-3`} />}
                          <span>{diffText}</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[var(--carbon-text-secondary)]">
                      {formatAppDate(record.date, 'monthDay')}
                      {record.note ? ` · ${record.note}` : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <SharePosterModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        filenamePrefix="milestone"
      >
        <div className="flex flex-col p-6 bg-[var(--carbon-bg)] items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)] mb-4">
            <span className="i-lucide-trophy h-8 w-8" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--carbon-text-secondary)] mb-1">
            {t('达成里程碑')}
          </p>
          <h2 className="text-2xl font-bold text-[var(--carbon-text)]">
            {formatWeightValue(milestone.startWeight, unit)}{' '}
            <span className="mx-2 text-[var(--carbon-outline)]">-&gt;</span>{' '}
            {formatWeightValue(milestone.targetWeight, unit)} {unitLabel}
          </h2>
          <p className="mt-2 text-xs text-[var(--carbon-text-secondary)]">
            {dayjs(milestone.startDate).format('YYYY/MM/DD')} -{' '}
            {milestone.completedDate
              ? dayjs(milestone.completedDate).format('YYYY/MM/DD')
              : t('至今')}
          </p>

          <div className="grid grid-cols-3 gap-4 w-full border-t border-[var(--carbon-border)] pt-5 mt-5">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--carbon-text-secondary)]">
                {t`总 ${direction} 重`}
              </span>
              <span className="mt-1 text-lg font-semibold text-[var(--carbon-text)]">
                {formatWeightValue(diff, unit)}{' '}
                <span className="text-[10px] font-normal">{unitLabel}</span>
              </span>
            </div>
            <div className="flex flex-col items-center border-l border-r border-[var(--carbon-border)]">
              <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--carbon-text-secondary)]">
                {t('用时')}
              </span>
              <span className="mt-1 text-lg font-semibold text-[var(--carbon-text)]">
                {days} <span className="text-[10px] font-normal">{t('天')}</span>
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--carbon-text-secondary)]">
                {t('日均')}
              </span>
              <span className="mt-1 text-lg font-semibold text-[var(--carbon-text)]">
                {averagePerDay}{' '}
                <span className="text-[10px] font-normal">{t`${unitLabel}/天`}</span>
              </span>
            </div>
          </div>
        </div>
      </SharePosterModal>
    </div>
  )
}
