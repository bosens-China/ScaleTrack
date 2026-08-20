import dayjs from 'dayjs'
import { useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import type { ActivityRecord, ActivitySavePayload, ActivityType } from '@/types'
import {
  findActivityRecordConflict,
  getActivityDaySummary,
  getActivityDisplayName,
} from '@/utils/activity'
import { toast } from '@/utils/toast'

import ActivityDurationGauge from './ActivityDurationGauge'
import RecordOverwriteModal from './RecordOverwriteModal'
import TextInput from './TextInput'

interface Props {
  activityRecords: ActivityRecord[]
  activityTypes: ActivityType[]
  initialRecord?: ActivityRecord
  onSave: (payload: ActivitySavePayload) => void
  onAddType: (name: string) => ActivityType | null
  onDeleteType: (id: string) => void
  onCancel?: () => void
  allowTypeManagement?: boolean
}

export default function ActivityRecordForm({
  activityRecords,
  activityTypes,
  initialRecord,
  onSave,
  onAddType,
  onDeleteType,
  onCancel,
  allowTypeManagement = true,
}: Props) {
  const { t, currentLang } = useI18n()
  const historicalType =
    initialRecord && !activityTypes.some(type => type.id === initialRecord.activityTypeId)
      ? {
          id: initialRecord.activityTypeId,
          name: t`${initialRecord.activityName}（已移除）`,
          icon: initialRecord.activityIcon,
          color: initialRecord.activityColor,
          isBuiltIn: false,
        }
      : null
  const selectableTypes = historicalType ? [historicalType, ...activityTypes] : activityTypes

  const [activityTypeId, setActivityTypeId] = useState(
    initialRecord?.activityTypeId ?? selectableTypes[0]?.id ?? '',
  )
  const [date, setDate] = useState(initialRecord?.date ?? dayjs().format('YYYY-MM-DD'))
  const [durationMinutes, setDurationMinutes] = useState(initialRecord?.durationMinutes ?? 45)
  const [note, setNote] = useState(initialRecord?.note ?? '')
  const [isAddingType, setIsAddingType] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [pendingConflict, setPendingConflict] = useState<ActivityRecord | null>(null)

  const selectedType = selectableTypes.find(type => type.id === activityTypeId)
  const customTypes = activityTypes.filter(type => !type.isBuiltIn)
  const daySummary = getActivityDaySummary(activityRecords, date)
  const conflictingTypeSummary = daySummary.items.find(
    item => item.activityTypeId === activityTypeId,
  )
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return t`${minutes} 分钟`
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest === 0 ? t`${hours} 小时` : t`${hours} 小时 ${rest} 分`
  }

  const save = (overwriteId?: string) => {
    onSave({
      id: initialRecord?.id,
      overwriteId,
      activityTypeId,
      date,
      durationMinutes,
      note: note.trim() || undefined,
    })
  }

  const handleAddType = () => {
    const name = newTypeName.trim()
    if (!name) {
      toast.error(t('请输入运动名称'))
      return
    }
    if (name.length > 12) {
      toast.error(t('运动名称最多 12 个字'))
      return
    }
    const type = onAddType(name)
    if (!type) return
    setActivityTypeId(type.id)
    setNewTypeName('')
    setIsAddingType(false)
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={event => {
        event.preventDefault()
        if (!activityTypeId) {
          toast.error(t('请选择运动类型'))
          return
        }
        if (date > dayjs().format('YYYY-MM-DD')) {
          toast.error(t('不能记录未来的运动'))
          return
        }
        const conflict = findActivityRecordConflict(
          activityRecords,
          { activityTypeId, date },
          initialRecord?.id,
        )
        if (conflict) {
          setPendingConflict(conflict)
          return
        }
        save()
      }}
    >
      <section className="sport-panel flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <label
            htmlFor="activity-type"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]"
          >
            {t('运动类型')}
          </label>
          {allowTypeManagement && (
            <button
              type="button"
              onClick={() => setIsAddingType(value => !value)}
              className="flex min-h-11 items-center gap-1.5 text-xs font-bold text-[var(--carbon-primary)]"
            >
              <span className="i-lucide-plus h-4 w-4" />
              {t('新增类型')}
            </button>
          )}
        </div>

        <div className="relative">
          {selectedType && (
            <span
              className={`${selectedType.icon} pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2`}
              style={{ color: selectedType.color }}
            />
          )}
          <select
            id="activity-type"
            value={activityTypeId}
            onChange={event => {
              setActivityTypeId(event.currentTarget.value)
              setPendingConflict(null)
            }}
            className="h-13 w-full appearance-none border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] pl-11 pr-10 text-base font-semibold text-[var(--carbon-text)]"
          >
            {selectableTypes.map(type => (
              <option key={type.id} value={type.id}>
                {getActivityDisplayName(type.name)}
              </option>
            ))}
          </select>
          <span className="i-lucide-chevron-down pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--carbon-text-secondary)]" />
        </div>

        {isAddingType && (
          <div className="flex gap-2">
            <input
              autoFocus
              value={newTypeName}
              maxLength={12}
              onChange={event => setNewTypeName(event.currentTarget.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleAddType()
                }
              }}
              placeholder={t('例如：攀岩')}
              className="h-11 min-w-0 flex-1 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-3 text-sm text-[var(--carbon-text)]"
              aria-label={t('新增运动类型名称')}
            />
            <button
              type="button"
              onClick={handleAddType}
              className="h-11 bg-[var(--carbon-primary)] px-4 text-sm font-bold text-[var(--carbon-text-on-primary)]"
            >
              {t('添加')}
            </button>
          </div>
        )}

        {allowTypeManagement && customTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-[var(--carbon-border)] pt-3">
            {customTypes.map(type => (
              <span
                key={type.id}
                className="flex min-h-9 items-center gap-1 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] pl-3 text-xs text-[var(--carbon-text)]"
              >
                {type.name}
                <button
                  type="button"
                  onClick={() => {
                    onDeleteType(type.id)
                    if (activityTypeId === type.id) {
                      setActivityTypeId(activityTypes.find(item => item.isBuiltIn)?.id ?? '')
                    }
                  }}
                  className="flex h-9 w-9 items-center justify-center text-[var(--carbon-text-secondary)] hover:text-[var(--color-danger)]"
                  aria-label={t`删除运动类型 ${type.name}`}
                >
                  <span className="i-lucide-x h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-[1fr_auto] items-end gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
            {t('运动日期')}
          </span>
          <input
            type="date"
            value={date}
            max={dayjs().format('YYYY-MM-DD')}
            onChange={event => {
              setDate(event.currentTarget.value)
              setPendingConflict(null)
            }}
            className="h-12 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-3 text-base font-semibold text-[var(--carbon-text)]"
            required
          />
        </label>
        <span className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--carbon-text-secondary)]">
          {date === dayjs().format('YYYY-MM-DD')
            ? t('今天')
            : new Intl.DateTimeFormat(currentLang, { weekday: 'short' }).format(
                dayjs(date).toDate(),
              )}
        </span>
      </section>

      {daySummary.typeCount > 0 && (
        <section className="border-l-4 border-[var(--sport-accent)] bg-[var(--carbon-surface-subtle)] px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="i-lucide-info mt-0.5 h-4 w-4 shrink-0 text-[var(--carbon-primary)]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-[var(--carbon-text)]">
                {t`当天已运动 ${daySummary.typeCount} 项，共 ${formatDuration(daySummary.totalMinutes)}`}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {daySummary.items.map(item => (
                  <span
                    key={item.activityTypeId}
                    className="inline-flex items-center gap-1.5 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-2 py-1 text-[11px] text-[var(--carbon-text-secondary)]"
                  >
                    <span
                      className={`${item.activityIcon} h-3.5 w-3.5`}
                      style={{ color: item.activityColor }}
                    />
                    {getActivityDisplayName(item.activityName)} ·{' '}
                    {formatDuration(item.durationMinutes)}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-5 text-[var(--carbon-text-secondary)]">
                {t('可继续添加不同项目；同类运动再次保存时会先询问是否覆盖。')}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex items-end justify-between px-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
              Duration
            </p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-[var(--carbon-text)]">
              {t('大概运动了多久？')}
            </h3>
          </div>
          <span className="sport-kicker">05—180+</span>
        </div>
        <ActivityDurationGauge value={durationMinutes} onChange={setDurationMinutes} />
      </section>

      <section className="flex flex-col gap-2">
        <label
          htmlFor="activity-note"
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]"
        >
          {t('备注（选填）')}
        </label>
        <TextInput
          id="activity-note"
          value={note}
          onChange={event => setNote(event.currentTarget.value)}
          placeholder={t('今天的状态、场地或搭档...')}
          rightElement={<span className="i-lucide-notebook-pen h-5 w-5" />}
        />
      </section>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-14 flex-1 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] text-sm font-bold text-[var(--carbon-text-secondary)]"
          >
            {t('取消')}
          </button>
        )}
        <button type="submit" className="sport-primary-button h-14 flex-[2] text-base font-black">
          <span className="i-lucide-check h-5 w-5" />
          {initialRecord ? t('保存修改') : t('完成运动打卡')}
        </button>
      </div>

      <RecordOverwriteModal
        isOpen={pendingConflict !== null}
        title={t('覆盖这项运动吗？')}
        description={t('同一天的同类运动会合并为一条，确认后将以本次填写内容替换已有记录。')}
        existingSummary={t`${selectedType ? getActivityDisplayName(selectedType.name) : ''} · ${formatDuration(conflictingTypeSummary?.durationMinutes ?? pendingConflict?.durationMinutes ?? 0)}`}
        nextSummary={t`${selectedType ? getActivityDisplayName(selectedType.name) : ''} · ${formatDuration(durationMinutes)}`}
        onCancel={() => setPendingConflict(null)}
        onConfirm={() => {
          if (!pendingConflict) return
          save(pendingConflict.id)
          setPendingConflict(null)
        }}
      />
    </form>
  )
}
