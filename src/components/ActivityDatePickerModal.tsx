import dayjs from 'dayjs'
import { useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import ModalPortal from '@/components/ModalPortal'
import { getCalendarLeadingDays, getWeekdayLabels } from '@/utils/week'

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  onSelectDate: (date: string) => void
}

/** 运动补录专用日历：点击日期即应用，避免系统控件要求二次确认。 */
export default function ActivityDatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: Props) {
  const { t, currentLang } = useI18n()
  const [currentMonth, setCurrentMonth] = useState(() => dayjs(selectedDate).startOf('month'))
  const todayStr = dayjs().format('YYYY-MM-DD')

  if (!isOpen) return null

  const daysInMonth = currentMonth.daysInMonth()
  const adjustedStartDay = getCalendarLeadingDays(currentMonth, currentLang)
  const grid: (dayjs.Dayjs | null)[] = []
  for (let index = 0; index < adjustedStartDay; index++) grid.push(null)
  for (let day = 1; day <= daysInMonth; day++) grid.push(currentMonth.date(day))

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
        aria-label={t('选择运动日期')}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentMonth(month => month.subtract(1, 'month'))}
            className="p-2 text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]"
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
            disabled={currentMonth.isSame(dayjs(), 'month')}
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
          {grid.map((dateObject, index) => {
            if (!dateObject) return <div key={`empty-${index}`} />

            const date = dateObject.format('YYYY-MM-DD')
            const isFuture = date > todayStr
            const isSelected = date === selectedDate
            const isToday = date === todayStr

            return (
              <button
                key={date}
                type="button"
                disabled={isFuture}
                onClick={() => {
                  onSelectDate(date)
                  onClose()
                }}
                className={`relative flex h-10 w-full items-center justify-center rounded-lg border text-sm transition-colors ${
                  isFuture
                    ? 'cursor-not-allowed border-transparent text-[var(--carbon-text-secondary)] opacity-30'
                    : 'cursor-pointer border-transparent text-[var(--carbon-text)] hover:bg-[var(--carbon-surface-hover)]'
                } ${
                  isSelected
                    ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] font-semibold text-[var(--carbon-primary)]'
                    : ''
                } ${isToday && !isSelected ? 'border-[var(--carbon-border)]' : ''}`}
                aria-label={isFuture ? t`${date}，未来日期不可选择` : date}
              >
                {dateObject.date()}
              </button>
            )
          })}
        </div>

        <p className="mt-4 text-center text-[11px] leading-5 text-[var(--carbon-text-secondary)]">
          {t('点击日期即可完成选择；不能记录未来的运动。')}
        </p>
      </div>
    </ModalPortal>
  )
}
