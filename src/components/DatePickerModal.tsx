import dayjs from 'dayjs'
import { useState, type ReactNode } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import ModalPortal from '@/components/ModalPortal'
import { getCalendarDates, getWeekdayLabels } from '@/utils/week'

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedDate?: string
  initialMonth: string
  onSelectDate: (date: string) => void
  minDate?: string
  maxDate?: string
  dialogLabel: string
  getDateAriaLabel?: (date: string, isSelectable: boolean) => string
  dateIndicator?: (date: string) => ReactNode
  footer?: ReactNode
}

/**
 * 通用日期选择弹窗：统一月切换、日历网格和键盘语义，业务页面只声明可选范围与附加标记。
 */
export default function DatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  initialMonth,
  onSelectDate,
  minDate,
  maxDate,
  dialogLabel,
  getDateAriaLabel,
  dateIndicator,
  footer,
}: Props) {
  const { t, currentLang } = useI18n()
  const [currentMonth, setCurrentMonth] = useState(() => dayjs(initialMonth).startOf('month'))

  if (!isOpen) return null

  const minMonth = minDate ? dayjs(minDate).startOf('month') : null
  const maxMonth = maxDate ? dayjs(maxDate).startOf('month') : null
  const calendarDates = getCalendarDates(currentMonth, currentLang)
  const today = dayjs().format('YYYY-MM-DD')

  return (
    <ModalPortal>
      <div
        className="app-modal-layer fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div
        className="app-modal-layer fixed left-0 right-0 top-0 flex flex-col rounded-b-2xl border-b border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4 pt-[calc(var(--safe-top)+1rem)] shadow-xl animate-in slide-in-from-top-4 fade-in duration-200 sm:mx-auto sm:max-w-[430px]"
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentMonth(month => month.subtract(1, 'month'))}
            disabled={minMonth !== null && currentMonth.isSame(minMonth, 'month')}
            className="p-2 text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)] disabled:opacity-30"
            aria-label={t('上个月')}
          >
            <span className="i-lucide-chevron-left h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-[var(--carbon-text)]">
            {t`${currentMonth.format('YYYY')}年 ${currentMonth.format('MM')}月`}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth(month => month.add(1, 'month'))}
            disabled={maxMonth !== null && currentMonth.isSame(maxMonth, 'month')}
            className="p-2 text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)] disabled:opacity-30"
            aria-label={t('下个月')}
          >
            <span className="i-lucide-chevron-right h-5 w-5" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {getWeekdayLabels(currentLang).map(day => (
            <div
              key={day}
              className="py-1 text-center text-xs font-medium text-[var(--carbon-text-secondary)]"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-x-1 gap-y-2">
          {calendarDates.map((dateObject, index) => {
            if (!dateObject) return <div key={`empty-${index}`} />

            const date = dateObject.format('YYYY-MM-DD')
            const isSelectable = (!minDate || date >= minDate) && (!maxDate || date <= maxDate)
            const isSelected = date === selectedDate
            const isToday = date === today

            return (
              <button
                key={date}
                type="button"
                disabled={!isSelectable}
                onClick={() => {
                  if (!isSelectable) return
                  onSelectDate(date)
                  onClose()
                }}
                className={`relative flex h-10 w-full flex-col items-center justify-center rounded-lg border text-sm transition-colors ${
                  !isSelectable
                    ? 'cursor-not-allowed border-transparent text-[var(--carbon-text-secondary)] opacity-30'
                    : 'cursor-pointer border-transparent text-[var(--carbon-text)] hover:bg-[var(--carbon-surface-hover)]'
                } ${
                  isSelected
                    ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] font-semibold text-[var(--carbon-primary)]'
                    : ''
                } ${isToday && !isSelected ? 'border-[var(--carbon-border)]' : ''}`}
                aria-label={
                  getDateAriaLabel?.(date, isSelectable) ??
                  (isSelectable ? date : t`${date}，超出可选范围`)
                }
              >
                <span>{dateObject.date()}</span>
                {isSelectable && dateIndicator?.(date)}
              </button>
            )
          })}
        </div>

        {footer}
      </div>
    </ModalPortal>
  )
}
