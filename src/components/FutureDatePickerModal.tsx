import dayjs from 'dayjs'
import { useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

interface Props {
  isOpen: boolean
  onClose: () => void
  /** 当前选中的日期（YYYY-MM-DD），未选则为空 */
  value?: string
  onSelect: (date: string) => void
  /** 可选范围下界，默认今天 */
  minDate?: string
  /** 可选范围上界，默认今天起两年后 */
  maxDate?: string
}

/**
 * Carbon 风格的未来日期选择器。
 * 与补录用的 CalendarModal 区分：用于设定「未来」目标日期，不展示记录点。
 */
export default function FutureDatePickerModal({
  isOpen,
  onClose,
  value,
  onSelect,
  minDate,
  maxDate,
}: Props) {
  const { t } = useI18n()
  const todayStr = dayjs().format('YYYY-MM-DD')
  const minStr = minDate ?? todayStr
  const maxStr = maxDate ?? dayjs().add(2, 'year').format('YYYY-MM-DD')

  const [currentMonth, setCurrentMonth] = useState(() =>
    dayjs(value && value >= minStr ? value : minStr).startOf('month'),
  )

  if (!isOpen) return null

  const minMonth = dayjs(minStr).startOf('month')
  const maxMonth = dayjs(maxStr).startOf('month')

  const handlePrevMonth = () => setCurrentMonth(prev => prev.subtract(1, 'month'))
  const handleNextMonth = () => setCurrentMonth(prev => prev.add(1, 'month'))

  // 生成日历网格（周一起始）
  const startDay = currentMonth.startOf('month').day() // 0 (日) ~ 6 (六)
  const daysInMonth = currentMonth.daysInMonth()
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1

  const grid: (dayjs.Dayjs | null)[] = []
  for (let i = 0; i < adjustedStartDay; i++) {
    grid.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(currentMonth.date(i))
  }

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
            disabled={currentMonth.isSame(minMonth, 'month')}
            className="p-2 text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)] disabled:opacity-30"
          >
            <span className="i-lucide-chevron-left h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-[var(--carbon-text)]">
            {t`${currentMonth.format('YYYY')}年 ${currentMonth.format('MM')}月`}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={currentMonth.isSame(maxMonth, 'month')}
            className="p-2 text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)] disabled:opacity-30"
          >
            <span className="i-lucide-chevron-right h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {[t('一'), t('二'), t('三'), t('四'), t('五'), t('六'), t('日')].map(day => (
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
            const isSelectable = dateStr >= minStr && dateStr <= maxStr
            const isSelected = dateStr === value
            const isToday = dateStr === todayStr

            return (
              <button
                key={dateStr}
                disabled={!isSelectable}
                onClick={() => {
                  if (!isSelectable) return
                  onSelect(dateStr)
                  onClose()
                }}
                className={`
                  relative flex h-10 w-full flex-col items-center justify-center rounded-lg border text-sm transition-colors
                  ${!isSelectable ? 'opacity-30 cursor-not-allowed border-transparent text-[var(--carbon-text-secondary)]' : 'cursor-pointer hover:bg-[var(--carbon-surface-hover)]'}
                  ${isSelected ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)] font-semibold' : 'border-transparent text-[var(--carbon-text)]'}
                  ${isToday && !isSelected ? 'border-[var(--carbon-border)]' : ''}
                `}
                aria-label={isSelectable ? dateStr : t`${dateStr}，超出可选范围`}
              >
                <span>{dateObj.date()}</span>
              </button>
            )
          })}
        </div>

        <p className="mt-4 text-center text-[11px] leading-5 text-[var(--carbon-text-secondary)]">
          {t('选择一个未来日期作为期望达成时间，可随时调整或清除。')}
        </p>
      </div>
    </>
  )
}
