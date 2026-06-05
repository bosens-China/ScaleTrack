import type { WeightRecord } from '../types'

export function getTimeOfDay(hour: number): string {
  if (hour >= 0 && hour < 5) return '凌晨'
  if (hour >= 5 && hour < 10) return '早晨'
  if (hour >= 10 && hour < 14) return '中午'
  if (hour >= 14 && hour < 19) return '下午'
  return '晚上'
}

export function getDefaultNote(
  latestRecord: WeightRecord | undefined | null,
  currentHour: number,
): string {
  if (latestRecord && latestRecord.note) {
    return latestRecord.note
  }
  return getTimeOfDay(currentHour)
}

export function toggleTagInNote(currentNote: string, tag: string): string {
  if (!currentNote) return tag

  // 以空格分割现有的 note
  const tags = currentNote.split(' ').filter(Boolean)

  if (tags.includes(tag)) {
    // 如果已经包含该 tag，则移除
    return tags.filter(t => t !== tag).join(' ')
  } else {
    // 否则追加
    return [...tags, tag].join(' ')
  }
}
