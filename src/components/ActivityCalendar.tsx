import dayjs from 'dayjs'
import { useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import type { ActivityRecord } from '@/types'
import { getActivityDaySummary, getActivityDisplayName } from '@/utils/activity'
import { formatAppDate } from '@/utils/date-format'
import { getCalendarLeadingDays, getWeekdayLabels } from '@/utils/week'

interface Props {
  activityRecords: ActivityRecord[]
}

// 独立维护月份和日期选择状态，避免运动总览页面承担日历内部交互。
export default function ActivityCalendar({ activityRecords }: Props) {
  const { t, currentLang } = useI18n()
  const [currentMonth, setCurrentMonth] = useState(() => dayjs().startOf('month'))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const today = dayjs().format('YYYY-MM-DD')
  const weekdayLabels = getWeekdayLabels(currentLang)
  const leadingDays = getCalendarLeadingDays(currentMonth, currentLang)
  const calendarCells: (dayjs.Dayjs | null)[] = [
    ...Array.from({ length: leadingDays }, () => null),
    ...Array.from({ length: currentMonth.daysInMonth() }, (_, index) =>
      currentMonth.date(index + 1),
    ),
  ]
  const recordsByDate = new Map<string, ActivityRecord[]>()
  for (const record of activityRecords) {
    const records = recordsByDate.get(record.date) ?? []
    records.push(record)
    recordsByDate.set(record.date, records)
  }
  const selectedSummary = selectedDate ? getActivityDaySummary(activityRecords, selectedDate) : null

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return t`${minutes} 分钟`
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest === 0 ? t`${hours} 小时` : t`${hours} 小时 ${rest} 分`
  }

  const changeMonth = (offset: number) => {
    setCurrentMonth(month => month.add(offset, 'month'))
    setSelectedDate(null)
  }

  return (
    <section className="sport-panel p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--carbon-text-secondary)] hover:bg-[var(--carbon-surface-subtle)]"
          aria-label={t('上个月')}
        >
          <span className="i-lucide-chevron-left h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="sport-kicker">Activity calendar</p>
          <h2 className="mt-1 text-base font-black text-[var(--carbon-text)]">
            {t`${currentMonth.format('YYYY')} 年 ${currentMonth.format('M')} 月`}
          </h2>
        </div>
        <button
          onClick={() => changeMonth(1)}
          disabled={currentMonth.isSame(dayjs(), 'month')}
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--carbon-text-secondary)] hover:bg-[var(--carbon-surface-subtle)] disabled:opacity-25"
          aria-label={t('下个月')}
        >
          <span className="i-lucide-chevron-right h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {weekdayLabels.map(label => (
          <span
            key={label}
            className="py-1 text-center text-[10px] font-bold text-[var(--carbon-text-secondary)]"
          >
            {label}
          </span>
        ))}
        {calendarCells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} />
          const dateString = date.format('YYYY-MM-DD')
          const dayRecords = recordsByDate.get(dateString) ?? []
          const daySummary = getActivityDaySummary(dayRecords, dateString)
          return (
            <button
              type="button"
              key={dateString}
              onClick={() => setSelectedDate(dateString)}
              aria-pressed={selectedDate === dateString}
              className={`flex aspect-square min-w-0 flex-col items-center justify-center gap-1 border text-xs ${
                selectedDate === dateString
                  ? 'border-[var(--sport-accent)] bg-[var(--carbon-primary-soft)]'
                  : dateString === today
                    ? 'border-[var(--carbon-primary)]'
                    : 'border-transparent'
              } ${dayRecords.length > 0 ? 'bg-[var(--carbon-surface-subtle)] font-black text-[var(--carbon-text)]' : 'text-[var(--carbon-text-secondary)]'}`}
              aria-label={
                daySummary.typeCount
                  ? t`${dateString}，${daySummary.typeCount} 项运动，共 ${formatDuration(daySummary.totalMinutes)}`
                  : t`${dateString}，没有运动记录`
              }
            >
              <span>{date.date()}</span>
              <span className="flex h-1.5 max-w-full gap-0.5 overflow-hidden">
                {daySummary.items.slice(0, 3).map(item => (
                  <span
                    key={item.activityTypeId}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: item.activityColor }}
                  />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      {selectedDate && selectedSummary && (
        <div
          className="mt-3 border-l-4 border-[var(--sport-accent)] bg-[var(--carbon-surface-subtle)] px-3 py-3 animate-fade-in"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black text-[var(--carbon-text)]">
              {formatAppDate(selectedDate, 'monthDayWeek')}
            </p>
            {selectedSummary.typeCount > 0 && (
              <span className="shrink-0 text-[11px] font-bold text-[var(--carbon-primary)]">
                {t`${selectedSummary.typeCount} 项 · ${formatDuration(selectedSummary.totalMinutes)}`}
              </span>
            )}
          </div>
          {selectedSummary.typeCount === 0 ? (
            <p className="mt-2 text-xs text-[var(--carbon-text-secondary)]">
              {t('当天没有运动记录')}
            </p>
          ) : (
            <div className="mt-2 grid gap-2">
              {selectedSummary.items.map(item => (
                <div
                  key={item.activityTypeId}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2 font-semibold text-[var(--carbon-text)]">
                    <span
                      className={`${item.activityIcon} h-4 w-4 shrink-0`}
                      style={{ color: item.activityColor }}
                    />
                    <span className="truncate">{getActivityDisplayName(item.activityName)}</span>
                  </span>
                  <span className="shrink-0 text-[var(--carbon-text-secondary)]">
                    {formatDuration(item.durationMinutes)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
