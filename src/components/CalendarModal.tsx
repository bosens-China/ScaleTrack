import dayjs from 'dayjs'
import { useState } from 'react'

import type { WeightRecord } from '@/types'

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
  const [currentMonth, setCurrentMonth] = useState(() => dayjs(selectedDate).startOf('month'))

  if (!isOpen) return null

  const todayStr = dayjs().format('YYYY-MM-DD')

  const handlePrevMonth = () => setCurrentMonth(prev => prev.subtract(1, 'month'))
  const handleNextMonth = () => setCurrentMonth(prev => prev.add(1, 'month'))

  // Generate calendar grid (Monday first)
  const startDay = currentMonth.startOf('month').day() // 0 (Sun) to 6 (Sat)
  const daysInMonth = currentMonth.daysInMonth()
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1

  const grid: (dayjs.Dayjs | null)[] = []
  for (let i = 0; i < adjustedStartDay; i++) {
    grid.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(currentMonth.date(i))
  }

  const recordDates = new Set(records.map(r => r.date))

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed left-0 right-0 top-0 z-[70] flex flex-col rounded-b-2xl border-b border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4 shadow-xl animate-in slide-in-from-top-4 fade-in duration-200 sm:mx-auto sm:max-w-[430px]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]"
          >
            <span className="i-lucide-chevron-left h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-[var(--carbon-text)]">
            {currentMonth.format('YYYY年 MM月')}
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
          {['一', '二', '三', '四', '五', '六', '日'].map(day => (
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
            const isFuture = dateStr > todayStr
            const isSelected = dateStr === selectedDate
            const hasRecord = recordDates.has(dateStr)
            const isToday = dateStr === todayStr

            return (
              <button
                key={dateStr}
                disabled={isFuture}
                onClick={() => {
                  onSelectDate(dateStr)
                  onClose()
                }}
                className={`
                  relative flex h-10 w-full flex-col items-center justify-center rounded-lg border text-sm transition-colors
                  ${isFuture ? 'opacity-30 cursor-not-allowed border-transparent text-[var(--carbon-text-secondary)]' : 'cursor-pointer hover:bg-[var(--carbon-surface-hover)]'}
                  ${isSelected ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)] font-semibold' : 'border-transparent text-[var(--carbon-text)]'}
                  ${isToday && !isSelected ? 'border-[var(--carbon-border)]' : ''}
                `}
              >
                <span>{dateObj.date()}</span>
                {!isFuture && (
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
            <span>已记录</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--carbon-border)]" />
            <span>未记录</span>
          </div>
        </div>
      </div>
    </>
  )
}
