import { t } from 'virtual:ai-i18n'

// 称重场景标签：与添加页 tag 列表共用同一词表，
// 保证“自动带入的备注”一定是下方能点亮/点掉的标签，而不是孤立的自由文本。
export const WEIGH_IN_TAGS = [
  '晨起空腹',
  '便后',
  '饭前',
  '饭后',
  '运动后',
  '大餐后',
  '睡前',
] as const

// 仅女性展示的场景标签
export const FEMALE_WEIGH_IN_TAGS = ['生理期'] as const

/** 预置称重标签以中文存储，展示时按界面语言转换，避免影响已有备注。 */
export function getWeighInTagLabel(tag: string): string {
  switch (tag) {
    case '晨起空腹':
      return t('晨起空腹')
    case '便后':
      return t('便后')
    case '饭前':
      return t('饭前')
    case '饭后':
      return t('饭后')
    case '运动后':
      return t('运动后')
    case '大餐后':
      return t('大餐后')
    case '睡前':
      return t('睡前')
    case '生理期':
      return t('生理期')
    default:
      return tag
  }
}

export function getTimeOfDay(hour: number): string {
  if (hour >= 0 && hour < 5) return '凌晨'
  if (hour >= 5 && hour < 10) return '早晨'
  if (hour >= 10 && hour < 14) return '中午'
  if (hour >= 14 && hour < 19) return '下午'
  return '晚上'
}

// 根据当前时段推断一个“称重场景”标签：
// 早晨是体重打卡最典型的场景，默认带入“晨起空腹”；
// 其它时段没有明确对应的场景标签，返回空串，避免写入词表里不存在的文本。
export function getAutoNoteTag(hour: number): string {
  if (hour >= 5 && hour < 10) return '晨起空腹'
  return ''
}

// 新记录的默认备注：按当前时段自动带入一个标签（可能为空）。
// 注意：不再复制上一条记录的备注——跨天/跨时段沿用旧备注既过时，
// 又可能和当前时段、当前 tag 高亮状态相互矛盾。
export function getDefaultNote(currentHour: number): string {
  return getAutoNoteTag(currentHour)
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
