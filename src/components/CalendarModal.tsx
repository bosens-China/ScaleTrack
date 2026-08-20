import dayjs from 'dayjs'
import { useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import ModalPortal from '@/components/ModalPortal'
import type { WeightRecord } from '@/types'
import { getEarliestRecordDate, isRecordDateSelectable } from '@/utils/record-date'
import { getCalendarLeadingDays, getWeekdayLabels } from '@/utils/week'

interface Props {
  isOpen: boolean
  onClose: () => void
  records: WeightRecord[]
  selectedDate: string
  onSelectDate: (date: string) => void
}

export default function CalendarModal({
  isOpen,
  onClose,
  records,
  selectedDate,
  onSelectDate,
}: Props) {
  const { t, currentLang } = useI18n()
  const [currentMonth, setCurrentMonth] = useState(() => dayjs(selectedDate).startOf('month'))

  if (!isOpen) return null

  const todayStr = dayjs().format('YYYY-MM-DD')
  const earliestDateStr = getEarliestRecordDate(todayStr)
  const earliestMonth = dayjs(earliestDateStr).startOf('month')

  const handlePrevMonth = () => setCurrentMonth(prev => prev.subtract(1, 'month'))
  const handleNextMonth = () => setCurrentMonth(prev => prev.add(1, 'month'))

  const daysInMonth = currentMonth.daysInMonth()
  const adjustedStartDay = getCalendarLeadingDays(currentMonth, currentLang)

  const grid: (dayjs.Dayjs | null)[] = []
  for (let i = 0; i < adjustedStartDay; i++) {
    grid.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(currentMonth.date(i))
  }

  const recordDates = new Set(records.map(r => r.date))

  return (
    <ModalPortal>
      <div
        className="app-modal-layer fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div className="app-modal-layer fixed left-0 right-0 top-0 flex flex-col rounded-b-2xl border-b border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4 pt-[calc(var(--safe-top)+1rem)] shadow-xl animate-in slide-in-from-top-4 fade-in duration-200 sm:mx-auto sm:max-w-[430px]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            disabled={currentMonth.isSame(earliestMonth, 'month')}
            className="p-2 text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)] disabled:opacity-30"
          >
            <span className="i-lucide-chevron-left h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-[var(--carbon-text)]">
            {t`${currentMonth.format('YYYY')}年 ${currentMonth.format('MM')}月`}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={currentMonth.isSame(dayjs(), 'month')}
            className="p-2 text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)] disabled:opacity-30"
          >
            <span className="i-lucide-chevron-right h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {getWeekdayLabels(currentLang).map(day => (
            <div
              key={day}
              className="text-center text-xs font-medium text-[var(--carbon-text-secondary)] py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
          {grid.map((dateObj, i) => {
            if (!dateObj) return <div key={`empty-${i}`} />

            const dateStr = dateObj.format('YYYY-MM-DD')
            const isSelectable = isRecordDateSelectable(dateStr, todayStr)
            const isFuture = dateStr > todayStr
            const isExpired = dateStr < earliestDateStr
            const isSelected = dateStr === selectedDate
            const hasRecord = recordDates.has(dateStr)
            const isToday = dateStr === todayStr

            return (
              <button
                key={dateStr}
                disabled={!isSelectable}
                onClick={() => {
                  if (!isSelectable) return
                  onSelectDate(dateStr)
                  onClose()
                }}
                className={`
                  relative flex h-10 w-full flex-col items-center justify-center rounded-lg border text-sm transition-colors
                  ${!isSelectable ? 'opacity-30 cursor-not-allowed border-transparent text-[var(--carbon-text-secondary)]' : 'cursor-pointer hover:bg-[var(--carbon-surface-hover)]'}
                  ${isSelected ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)] font-semibold' : 'border-transparent text-[var(--carbon-text)]'}
                  ${isToday && !isSelected ? 'border-[var(--carbon-border)]' : ''}
                `}
                aria-label={
                  isFuture
                    ? t`${dateStr}，未来日期不可选择`
                    : isExpired
                      ? t`${dateStr}，超出可补录范围`
                      : dateStr
                }
              >
                <span>{dateObj.date()}</span>
                {isSelectable && (
                  <div className="absolute bottom-1.5 flex justify-center">
                    {hasRecord ? (
                      <span className="h-1 w-1 rounded-full bg-[var(--carbon-primary)]" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-[var(--carbon-border)]" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-[var(--carbon-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--carbon-primary)]" />
            <span>{t('已记录')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--carbon-border)]" />
            <span>{t('未记录')}</span>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] leading-5 text-[var(--carbon-text-secondary)]">
          {t('仅支持补录最近 1 个月内的数据，今天仍可重复覆盖保存。')}
        </p>
      </div>
    </ModalPortal>
  )
}
