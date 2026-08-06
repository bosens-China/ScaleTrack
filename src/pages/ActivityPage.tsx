import dayjs from 'dayjs'
import { useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import ActivityRecordForm from '@/components/ActivityRecordForm'
import type { ActivityRecord, ActivityType, AppPage } from '@/types'
import {
  getActivityDisplayName,
  getActivityWeekFrequencies,
  getActivityWeekStats,
} from '@/utils/activity'
import { formatAppDate } from '@/utils/date-format'

interface ActivitySavePayload {
  id?: string
  activityTypeId: string
  date: string
  durationMinutes: number
  note?: string
}

interface Props {
  activityRecords: ActivityRecord[]
  activityTypes: ActivityType[]
  onNavigate: (page: AppPage) => void
  onSaveRecord: (payload: ActivitySavePayload) => void
  onDeleteRecord: (id: string) => void
  onAddType: (name: string) => ActivityType | null
  onDeleteType: (id: string) => void
}

export default function ActivityPage({
  activityRecords,
  activityTypes,
  onNavigate,
  onSaveRecord,
  onDeleteRecord,
  onAddType,
  onDeleteType,
}: Props) {
  const { t } = useI18n()
  const [currentMonth, setCurrentMonth] = useState(() => dayjs().startOf('month'))
  const [editingRecord, setEditingRecord] = useState<ActivityRecord | null>(null)

  const today = dayjs().format('YYYY-MM-DD')
  const weekStats = getActivityWeekStats(activityRecords, today)
  const weekFrequencies = getActivityWeekFrequencies(activityRecords, 12, today)
  const recentRecords = [...activityRecords]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20)

  const activityCount = new Map<string, number>()
  for (const record of activityRecords) {
    activityCount.set(record.activityName, (activityCount.get(record.activityName) ?? 0) + 1)
  }
  const favoriteActivity = [...activityCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  const favoriteActivityLabel = favoriteActivity
    ? getActivityDisplayName(favoriteActivity)
    : t('暂无')
  const weekdayLabels = [t('一'), t('二'), t('三'), t('四'), t('五'), t('六'), t('日')]
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return t`${minutes} 分钟`
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest === 0 ? t`${hours} 小时` : t`${hours} 小时 ${rest} 分`
  }

  const firstDayOffset = currentMonth.startOf('month').day()
  const leadingDays = firstDayOffset === 0 ? 6 : firstDayOffset - 1
  const calendarCells: (dayjs.Dayjs | null)[] = [
    ...Array.from({ length: leadingDays }, () => null),
    ...Array.from({ length: currentMonth.daysInMonth() }, (_, index) =>
      currentMonth.date(index + 1),
    ),
  ]
  const recordsByDate = new Map<string, ActivityRecord[]>()
  for (const record of activityRecords) {
    const list = recordsByDate.get(record.date) ?? []
    list.push(record)
    recordsByDate.set(record.date, list)
  }

  return (
    <div className="app-page sport-grid-bg bg-[var(--carbon-bg)] animate-fade-in">
      <main className="app-main flex flex-col gap-5 px-4 pb-8 pt-4">
        <header className="flex items-start justify-between">
          <div>
            <p className="sport-kicker">{t('运动 / 运动节律')}</p>
            <h1 className="mt-1 text-[32px] font-black tracking-[-0.04em] text-[var(--carbon-text)]">
              {t('我的运动')}
            </h1>
          </div>
          <button
            onClick={() => onNavigate('add')}
            className="sport-primary-button min-h-11 px-4 text-sm font-black"
          >
            <span className="i-lucide-plus h-4 w-4" />
            {t('打卡')}
          </button>
        </header>

        <section className="sport-hero relative overflow-hidden p-5">
          <div className="absolute -right-5 -top-11 text-[150px] font-black leading-none text-[var(--sport-hero-number)]">
            07
          </div>
          <div className="relative">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                  This week
                </p>
                <p className="mt-2 flex items-end gap-2">
                  <span className="text-[54px] font-black leading-none">
                    {weekStats.activeDays}
                  </span>
                  <span className="pb-1 text-sm font-bold opacity-70">{t('天运动')}</span>
                </p>
              </div>
              <div className="pb-1 text-right">
                <p className="text-lg font-black">{t`${weekStats.sessions} 次`}</p>
                <p className="mt-1 text-xs opacity-60">{formatDuration(weekStats.totalMinutes)}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2">
              {weekStats.days.map((day, index) => (
                <div key={day.date} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold opacity-55">{weekdayLabels[index]}</span>
                  <span
                    className={`flex h-8 w-full min-w-0 items-center justify-center border text-[10px] font-black ${
                      day.active
                        ? 'border-[var(--sport-accent)] bg-[var(--sport-accent)] text-[var(--sport-accent-text)]'
                        : day.date === today
                          ? 'border-[var(--sport-accent)] text-[var(--sport-accent)]'
                          : 'border-[var(--sport-hero-border)] text-transparent'
                    }`}
                    aria-label={
                      day.active ? t`${day.date}，${day.sessions} 次运动` : t`${day.date}，未运动`
                    }
                  >
                    {day.active ? day.sessions : '0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          {[
            [t('本周次数'), `${weekStats.sessions}`, 'i-lucide-repeat-2'],
            [t('本周时长'), `${weekStats.totalMinutes}`, 'i-lucide-timer'],
            [t('最常运动'), favoriteActivityLabel, 'i-lucide-award'],
          ].map(([label, value, icon]) => (
            <div key={label} className="sport-panel min-w-0 p-3">
              <span className={`${icon} h-4 w-4 text-[var(--carbon-primary)]`} />
              <p className="mt-3 truncate text-xl font-black text-[var(--carbon-text)]">{value}</p>
              <p className="mt-1 truncate text-[10px] font-bold text-[var(--carbon-text-secondary)]">
                {label}
                {label === t('本周时长') ? t('（分）') : ''}
              </p>
            </div>
          ))}
        </section>

        <section className="sport-panel p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="sport-kicker">12-week rhythm</p>
              <h2 className="mt-1 text-lg font-black text-[var(--carbon-text)]">{t('运动频率')}</h2>
            </div>
            <span className="text-xs font-semibold text-[var(--carbon-text-secondary)]">
              {t('每周运动天数')}
            </span>
          </div>

          <div className="mt-5 flex h-32 items-end gap-1.5 border-b border-[var(--carbon-border)] pb-1">
            {weekFrequencies.map((week, index) => (
              <div key={week.startDate} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <span
                  className="min-h-1 w-full bg-[var(--carbon-surface-strong)] transition-[height] duration-300"
                  style={{
                    height: `${Math.max(4, (week.activeDays / 7) * 100)}%`,
                    backgroundColor:
                      week.activeDays > 0 ? 'var(--sport-accent)' : 'var(--carbon-surface-strong)',
                    opacity: index === weekFrequencies.length - 1 ? 1 : 0.72,
                  }}
                  title={t`${week.label}：${week.activeDays} 天`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] font-bold text-[var(--carbon-text-secondary)]">
            <span>{weekFrequencies[0]?.label}</span>
            <span>{weekFrequencies.at(-1)?.label}</span>
          </div>
        </section>

        <section className="sport-panel p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth(month => month.subtract(1, 'month'))}
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
              onClick={() => setCurrentMonth(month => month.add(1, 'month'))}
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
              return (
                <div
                  key={dateString}
                  className={`flex aspect-square min-w-0 flex-col items-center justify-center gap-1 border text-xs ${
                    dateString === today ? 'border-[var(--carbon-primary)]' : 'border-transparent'
                  } ${dayRecords.length > 0 ? 'bg-[var(--carbon-surface-subtle)] font-black text-[var(--carbon-text)]' : 'text-[var(--carbon-text-secondary)]'}`}
                  aria-label={
                    dayRecords.length ? t`${dateString}，${dayRecords.length} 次运动` : dateString
                  }
                >
                  <span>{date.date()}</span>
                  <span className="flex h-1.5 max-w-full gap-0.5 overflow-hidden">
                    {dayRecords.slice(0, 3).map(record => (
                      <span
                        key={record.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: record.activityColor }}
                      />
                    ))}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between px-1">
            <div>
              <p className="sport-kicker">History</p>
              <h2 className="mt-1 text-lg font-black text-[var(--carbon-text)]">{t('最近运动')}</h2>
            </div>
            <span className="text-xs text-[var(--carbon-text-secondary)]">
              {t`共 ${activityRecords.length} 次`}
            </span>
          </div>

          {recentRecords.length === 0 ? (
            <div className="sport-panel flex flex-col items-center gap-4 px-5 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)]">
                <span className="i-lucide-activity h-7 w-7" />
              </span>
              <div>
                <h3 className="text-lg font-black text-[var(--carbon-text)]">
                  {t('还没有运动记录')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--carbon-text-secondary)]">
                  {t('不必等到完美的一次训练，从今天做过的运动开始。')}
                </p>
              </div>
              <button
                onClick={() => onNavigate('add')}
                className="sport-primary-button min-h-11 px-5 text-sm font-black"
              >
                {t('记录第一次运动')}
              </button>
            </div>
          ) : (
            <div className="activity-record-list carbon-scrollbar flex flex-col gap-2">
              {recentRecords.map(record => (
                <article key={record.id} className="sport-panel flex items-center gap-3 p-3.5">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${record.activityColor} 18%, transparent)`,
                      color: record.activityColor,
                    }}
                  >
                    <span className={`${record.activityIcon} h-5 w-5`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="truncate text-sm font-black text-[var(--carbon-text)]">
                        {getActivityDisplayName(record.activityName)}
                      </h3>
                      <span className="shrink-0 text-xs font-bold text-[var(--carbon-primary)]">
                        {formatDuration(record.durationMinutes)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--carbon-text-secondary)]">
                      {formatAppDate(record.date, 'monthDayWeek')}
                      {record.note ? ` · ${record.note}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingRecord(record)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-primary)]"
                    aria-label={t`编辑 ${getActivityDisplayName(record.activityName)} 记录`}
                  >
                    <span className="i-lucide-pencil h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          t`删除 ${getActivityDisplayName(record.activityName)} 这条运动记录？`,
                        )
                      ) {
                        onDeleteRecord(record.id)
                      }
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--carbon-text-secondary)] hover:text-[var(--color-danger)]"
                    aria-label={t`删除 ${getActivityDisplayName(record.activityName)} 记录`}
                  >
                    <span className="i-lucide-trash-2 h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {editingRecord && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-[398px] border border-[var(--carbon-border)] bg-[var(--carbon-bg)] p-4 shadow-2xl animate-scale-in">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="sport-kicker">Edit record</p>
                <h2 className="mt-1 text-xl font-black text-[var(--carbon-text)]">
                  {t('修改运动记录')}
                </h2>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--carbon-text-secondary)]"
                aria-label={t('关闭编辑')}
              >
                <span className="i-lucide-x h-5 w-5" />
              </button>
            </div>
            <ActivityRecordForm
              activityTypes={activityTypes}
              initialRecord={editingRecord}
              onSave={payload => {
                onSaveRecord(payload)
                setEditingRecord(null)
              }}
              onAddType={onAddType}
              onDeleteType={onDeleteType}
              onCancel={() => setEditingRecord(null)}
              allowTypeManagement={false}
            />
          </div>
        </div>
      )}
    </div>
  )
}
