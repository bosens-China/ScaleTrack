import dayjs from 'dayjs'
import { useEffect, useRef } from 'react'
import { useI18n } from 'virtual:ai-i18n'

interface ColumnProps {
  options: { value: number; label: string }[]
  value: number
  onChange: (val: number) => void
}

function ScrollColumn({ options, value, onChange }: ColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemHeight = 40 // px

  useEffect(() => {
    if (containerRef.current) {
      const idx = options.findIndex(o => o.value === value)
      if (idx >= 0) {
        containerRef.current.scrollTop = idx * itemHeight
      }
    }
  }, [value, options])

  const handleScroll = () => {
    if (!containerRef.current) return
    const scrollTop = containerRef.current.scrollTop
    const idx = Math.round(scrollTop / itemHeight)
    if (idx >= 0 && idx < options.length) {
      const selectedValue = options[idx].value
      if (selectedValue !== value) {
        onChange(selectedValue)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="h-[120px] flex-1 overflow-y-auto carbon-scrollbar relative"
      style={{ scrollSnapType: 'y mandatory' }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${(options.length - 1) * itemHeight + 120}px`,
          paddingTop: '40px',
          paddingBottom: '40px',
        }}
      >
        {options.map(opt => {
          const isSelected = opt.value === value
          return (
            <div
              key={opt.value}
              className="flex h-[40px] items-center justify-center text-sm transition-all duration-200"
              style={{
                scrollSnapAlign: 'center',
                color: isSelected ? 'var(--carbon-text)' : 'var(--carbon-text-secondary)',
                fontWeight: isSelected ? 500 : 400,
                opacity: isSelected ? 1 : 0.6,
              }}
            >
              {opt.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface Props {
  value?: string // YYYY-MM-DD
  onChange: (date: string) => void
}

export default function BirthDatePicker({ value, onChange }: Props) {
  const { t } = useI18n()
  const currentYear = dayjs().year()
  const currentMonth = value ? dayjs(value).month() + 1 : 1
  const currentDay = value ? dayjs(value).date() : 1
  const yearValue = value ? dayjs(value).year() : currentYear - 25

  const years = Array.from({ length: 90 }, (_, i) => {
    const y = currentYear - 100 + i
    return { value: y, label: t`${y}年` }
  }).reverse()

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: t`${i + 1}月`,
  }))

  const daysInMonth = dayjs(`${yearValue}-${currentMonth}-01`).daysInMonth()
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: t`${i + 1}日`,
  }))

  // Trigger onChange with default values if currently undefined
  useEffect(() => {
    if (!value) {
      const defaultDate = dayjs().year(yearValue).month(0).date(1).format('YYYY-MM-DD')
      onChange(defaultDate)
    }
  }, [value, yearValue, onChange])

  const handleYearChange = (y: number) => {
    const newDate = dayjs(`${y}-${currentMonth}-${currentDay}`)
    // adjust day if month has fewer days
    const maxDay = newDate.daysInMonth()
    const safeDay = currentDay > maxDay ? maxDay : currentDay
    onChange(dayjs(`${y}-${currentMonth}-${safeDay}`).format('YYYY-MM-DD'))
  }

  const handleMonthChange = (m: number) => {
    const newDate = dayjs(`${yearValue}-${m}-01`)
    const maxDay = newDate.daysInMonth()
    const safeDay = currentDay > maxDay ? maxDay : currentDay
    onChange(dayjs(`${yearValue}-${m}-${safeDay}`).format('YYYY-MM-DD'))
  }

  const handleDayChange = (d: number) => {
    onChange(dayjs(`${yearValue}-${currentMonth}-${d}`).format('YYYY-MM-DD'))
  }

  return (
    <div className="relative flex w-full items-center justify-between overflow-hidden rounded border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-2">
      {/* 选中框的高亮背景 */}
      <div className="pointer-events-none absolute left-0 top-[40px] h-[40px] w-full bg-[var(--carbon-surface-variant)] opacity-50" />
      <ScrollColumn options={years} value={yearValue} onChange={handleYearChange} />
      <ScrollColumn options={months} value={currentMonth} onChange={handleMonthChange} />
      <ScrollColumn options={days} value={currentDay} onChange={handleDayChange} />
    </div>
  )
}
