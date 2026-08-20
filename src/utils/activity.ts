import dayjs from 'dayjs'
import { t } from 'virtual:ai-i18n'

import type { ActivityRecord, ActivityType } from '@/types'
import { getWeekStart } from '@/utils/week'

/** 首版只内置高频项目；自定义类型负责覆盖个人化长尾需求 */
export const BUILT_IN_ACTIVITY_TYPES: ActivityType[] = [
  {
    id: 'builtin-fitness',
    name: '健身',
    icon: 'i-lucide-dumbbell',
    color: '#c7f36b',
    isBuiltIn: true,
  },
  {
    id: 'builtin-swimming',
    name: '游泳',
    icon: 'i-lucide-waves',
    color: '#42d9f5',
    isBuiltIn: true,
  },
  {
    id: 'builtin-badminton',
    name: '羽毛球',
    icon: 'i-lucide-target',
    color: '#ffad5c',
    isBuiltIn: true,
  },
  {
    id: 'builtin-running',
    name: '跑步',
    icon: 'i-lucide-person-standing',
    color: '#ff6b6b',
    isBuiltIn: true,
  },
  {
    id: 'builtin-cycling',
    name: '骑行',
    icon: 'i-lucide-bike',
    color: '#a78bfa',
    isBuiltIn: true,
  },
  {
    id: 'builtin-walking',
    name: '步行',
    icon: 'i-lucide-footprints',
    color: '#5ee6a8',
    isBuiltIn: true,
  },
  {
    id: 'builtin-yoga',
    name: '瑜伽',
    icon: 'i-lucide-sparkles',
    color: '#f472b6',
    isBuiltIn: true,
  },
  {
    id: 'builtin-ball',
    name: '球类',
    icon: 'i-lucide-circle-dot',
    color: '#facc15',
    isBuiltIn: true,
  },
]

/** 内置运动类型使用稳定中文值存储，界面显示随语言切换。 */
export function getActivityDisplayName(name: string): string {
  switch (name) {
    case '健身':
      return t('健身')
    case '游泳':
      return t('游泳')
    case '羽毛球':
      return t('羽毛球')
    case '跑步':
      return t('跑步')
    case '骑行':
      return t('骑行')
    case '步行':
      return t('步行')
    case '瑜伽':
      return t('瑜伽')
    case '球类':
      return t('球类')
    default:
      return name
  }
}

export interface ActivityWeekStats {
  startDate: string
  endDate: string
  activeDays: number
  sessions: number
  totalMinutes: number
  days: { date: string; active: boolean; sessions: number }[]
  typeBreakdown: { name: string; color: string; sessions: number }[]
}

/** 运动频率以“运动天数”为主，同一天多次运动只算一个活跃日 */
export function getActivityWeekStats(
  records: ActivityRecord[],
  referenceDate: string = dayjs().format('YYYY-MM-DD'),
  language = 'zh-CN',
): ActivityWeekStats {
  const start = getWeekStart(referenceDate, language)
  const end = start.add(6, 'day')
  const current = records.filter(record => {
    const date = dayjs(record.date)
    return !date.isBefore(start, 'day') && !date.isAfter(end, 'day')
  })

  const sessionsByDate = new Map<string, number>()
  const sessionsByType = new Map<string, { name: string; color: string; sessions: number }>()
  for (const record of current) {
    sessionsByDate.set(record.date, (sessionsByDate.get(record.date) ?? 0) + 1)
    const type = sessionsByType.get(record.activityName)
    sessionsByType.set(record.activityName, {
      name: record.activityName,
      color: record.activityColor,
      sessions: (type?.sessions ?? 0) + 1,
    })
  }

  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
    activeDays: sessionsByDate.size,
    sessions: current.length,
    totalMinutes: current.reduce((sum, record) => sum + record.durationMinutes, 0),
    days: Array.from({ length: 7 }, (_, index) => {
      const date = start.add(index, 'day').format('YYYY-MM-DD')
      const sessions = sessionsByDate.get(date) ?? 0
      return { date, active: sessions > 0, sessions }
    }),
    typeBreakdown: [...sessionsByType.values()].sort(
      (a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name, 'zh-CN'),
    ),
  }
}

export interface ActivityWeekFrequency {
  label: string
  startDate: string
  activeDays: number
  sessions: number
}

export function getActivityWeekFrequencies(
  records: ActivityRecord[],
  count = 12,
  referenceDate: string = dayjs().format('YYYY-MM-DD'),
  language = 'zh-CN',
): ActivityWeekFrequency[] {
  const currentWeekStart = getWeekStart(referenceDate, language)

  return Array.from({ length: count }, (_, index) => {
    const start = currentWeekStart.subtract(count - index - 1, 'week')
    const stats = getActivityWeekStats(records, start.format('YYYY-MM-DD'), language)
    return {
      label: start.format('MM/DD'),
      startDate: stats.startDate,
      activeDays: stats.activeDays,
      sessions: stats.sessions,
    }
  })
}

export interface ActivityDaySummaryItem {
  activityTypeId: string
  activityName: string
  activityIcon: string
  activityColor: string
  durationMinutes: number
  recordCount: number
}

export interface ActivityDaySummary {
  typeCount: number
  recordCount: number
  totalMinutes: number
  items: ActivityDaySummaryItem[]
}

/** 同日同类旧数据按类型聚合，提醒和日历展示不会把重复数据误读成多个项目。 */
export function getActivityDaySummary(
  records: ActivityRecord[],
  date: string,
  excludeId?: string,
): ActivityDaySummary {
  const itemsByType = new Map<string, ActivityDaySummaryItem>()
  let recordCount = 0

  for (const record of records) {
    if (record.date !== date || record.id === excludeId) continue
    recordCount += 1
    const current = itemsByType.get(record.activityTypeId)
    itemsByType.set(record.activityTypeId, {
      activityTypeId: record.activityTypeId,
      activityName: record.activityName,
      activityIcon: record.activityIcon,
      activityColor: record.activityColor,
      durationMinutes: (current?.durationMinutes ?? 0) + record.durationMinutes,
      recordCount: (current?.recordCount ?? 0) + 1,
    })
  }

  const items = [...itemsByType.values()]
  return {
    typeCount: items.length,
    recordCount,
    totalMinutes: items.reduce((sum, item) => sum + item.durationMinutes, 0),
    items,
  }
}

export function findActivityRecordConflict(
  records: ActivityRecord[],
  input: Pick<ActivityRecord, 'date' | 'activityTypeId'>,
  excludeId?: string,
): ActivityRecord | null {
  return (
    [...records]
      .reverse()
      .find(
        record =>
          record.id !== excludeId &&
          record.date === input.date &&
          record.activityTypeId === input.activityTypeId,
      ) ?? null
  )
}

/** 覆盖时清理所有同日同类重复项；编辑撞车时也移除原编辑记录。 */
export function getActivityOverwriteRemovalIds(
  records: ActivityRecord[],
  input: Pick<ActivityRecord, 'date' | 'activityTypeId'> & {
    keepId: string
    editingId?: string
  },
): string[] {
  const ids = new Set(
    records
      .filter(
        record =>
          record.id !== input.keepId &&
          record.date === input.date &&
          record.activityTypeId === input.activityTypeId,
      )
      .map(record => record.id),
  )
  if (input.editingId && input.editingId !== input.keepId) ids.add(input.editingId)
  return [...ids]
}
