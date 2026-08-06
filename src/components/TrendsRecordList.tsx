import { useEffect, useRef, useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import TextInput from '@/components/TextInput'
import { useWeightUnit } from '@/hooks/weight-unit-context'
import type { Goal, WeightRecord } from '@/types'
import { formatAppDate } from '@/utils/date-format'
import { toast } from '@/utils/toast'
import { validateWeight } from '@/utils/validation'
import {
  formatWeight,
  formatWeightValue,
  fromDisplayWeight,
  getWeightUnitLabel,
  toDisplayWeight,
} from '@/utils/weight-unit'

interface Props {
  records: WeightRecord[]
  goal: Goal | null
  onUpdateRecord: (id: string, patch: { weight?: number; note?: string }) => void
  onDeleteRecord: (id: string) => void
}

/**
 * 趋势页「所有记录」流水账：从趋势页拆出，自管编辑/删除的内联交互态。
 */
export default function TrendsRecordList({ records, goal, onUpdateRecord, onDeleteRecord }: Props) {
  const { t } = useI18n()
  const { unit } = useWeightUnit()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editWeight, setEditWeight] = useState('')
  const [editNote, setEditNote] = useState('')
  const editPanelRef = useRef<HTMLDivElement>(null)

  const isGainGoal = goal !== null && goal.targetWeight > goal.startWeight
  const recentRecords = [...records].reverse()

  const handleDeleteClick = (id: string) => {
    setEditingId(null)
    setPendingDeleteId(id)
  }

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDeleteRecord(pendingDeleteId)
      setPendingDeleteId(null)
    }
  }

  const handleEditClick = (record: WeightRecord) => {
    setPendingDeleteId(null)
    setEditingId(record.id)
    setEditWeight(formatWeightValue(record.weight, unit))
    setEditNote(record.note ?? '')
  }

  // 内联编辑区可能位于长列表底部，展开后主动滚入固定 Tab 栏上方的可操作区域。
  useEffect(() => {
    if (!editingId) return

    editPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [editingId])

  const handleConfirmEdit = (id: string) => {
    const parsedDisplay = Number.parseFloat(editWeight)
    const parsed = fromDisplayWeight(parsedDisplay, unit)
    if (Number.isNaN(parsedDisplay) || !validateWeight(parsed)) {
      toast.error(t('请输入有效的体重'))
      return
    }
    onUpdateRecord(id, { weight: parsed, note: editNote.trim() })
    setEditingId(null)
  }

  return (
    <section className="mt-6 border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--carbon-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="i-lucide-list h-4 w-4 text-[var(--carbon-primary)]" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--carbon-text-secondary)]">
            {t('所有记录')}
          </span>
        </div>
        <p className="text-xs font-medium text-[var(--carbon-text)]">{t`共 ${records.length} 条`}</p>
      </div>

      <div className="trends-record-list carbon-scrollbar flex flex-col">
        {recentRecords.map((record, index) => {
          const prevRecord = recentRecords[index + 1]
          const isFirstRecord = record.id === records[0]?.id

          let diffTone = 'text-[var(--carbon-text-secondary)]'
          let diffIcon = 'i-lucide-minus'
          let diffText = ''

          if (prevRecord) {
            const diff = record.weight - prevRecord.weight
            const dispDiff = toDisplayWeight(diff, unit)
            if (diff > 0) {
              diffTone = isGainGoal ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
              diffIcon = 'i-lucide-trending-up'
              diffText = `+${dispDiff.toFixed(1)}`
            } else if (diff < 0) {
              diffTone = isGainGoal ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'
              diffIcon = 'i-lucide-trending-down'
              diffText = `${dispDiff.toFixed(1)}`
            } else {
              diffText = t('持平')
            }
          }

          const isEditing = editingId === record.id

          return (
            <div
              key={record.id}
              className="flex flex-col border-b border-[var(--carbon-border)] last:border-b-0"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--carbon-text)]">
                      {formatWeight(record.weight, unit)}
                    </span>
                    {prevRecord && (
                      <span className={`flex items-center gap-0.5 text-[11px] ${diffTone}`}>
                        {diffText !== t('持平') && <span className={`${diffIcon} h-3 w-3`} />}
                        <span>{diffText}</span>
                      </span>
                    )}
                    {isFirstRecord && !record.note && (
                      <span className="rounded-sm bg-[var(--carbon-primary-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--carbon-primary)]">
                        {t('初始体重')}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--carbon-text-secondary)]">
                    {formatAppDate(record.date)}
                    {record.note ? ` · ${record.note}` : ''}
                  </p>
                </div>
                <div className="ml-3 flex shrink-0 items-center">
                  <button
                    onClick={() => (isEditing ? setEditingId(null) : handleEditClick(record))}
                    className={`flex h-8 w-8 items-center justify-center transition-colors hover:text-[var(--carbon-primary)] ${isEditing ? 'text-[var(--carbon-primary)]' : 'text-[var(--carbon-outline)]'}`}
                    aria-label={t('编辑记录')}
                  >
                    <span className="i-lucide-pencil h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(record.id)}
                    className="flex h-8 w-8 items-center justify-center text-[var(--carbon-outline)] transition-colors hover:text-[var(--color-danger)]"
                    aria-label={t('删除记录')}
                  >
                    <span className="i-lucide-trash-2 h-4 w-4" />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div
                  ref={editPanelRef}
                  className="flex flex-col gap-3 border-t border-[var(--carbon-primary)] bg-[var(--carbon-surface-subtle)] px-4 py-3"
                  style={{ scrollMarginBottom: 'calc(var(--app-tabbar-height) + 16px)' }}
                >
                  <div className="flex items-center gap-2">
                    <TextInput
                      type="number"
                      inputMode="decimal"
                      value={editWeight}
                      onChange={event => setEditWeight(event.target.value)}
                      wrapperClassName="flex-1 !h-10"
                      placeholder={t`体重（${getWeightUnitLabel(unit)}）`}
                    />
                    <button
                      onClick={() => handleConfirmEdit(record.id)}
                      className="flex h-10 shrink-0 items-center justify-center bg-[var(--carbon-primary)] px-4 text-xs font-medium text-[var(--carbon-text-on-primary)] hover:bg-[var(--carbon-primary-hover)]"
                    >
                      {t('保存')}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex h-10 shrink-0 items-center justify-center px-3 text-xs text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]"
                    >
                      {t('取消')}
                    </button>
                  </div>
                  <TextInput
                    type="text"
                    value={editNote}
                    onChange={event => setEditNote(event.target.value)}
                    placeholder={t('备注（选填）')}
                    wrapperClassName="!h-10"
                  />
                </div>
              )}
              {pendingDeleteId === record.id && (
                <div className="flex items-center justify-between border-t border-[var(--color-danger)] bg-[var(--carbon-surface-subtle)] px-4 py-2.5">
                  <p className="text-xs text-[var(--carbon-text-secondary)]">
                    {t('确认删除这条记录？')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingDeleteId(null)}
                      className="px-3 py-1 text-xs text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]"
                    >
                      {t('取消')}
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="bg-[var(--color-danger)] px-3 py-1 text-xs font-medium text-white"
                    >
                      {t('删除')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
