import dayjs from 'dayjs'
import { useState } from 'react'

import CalendarModal from '@/components/CalendarModal'
import TextInput from '@/components/TextInput'
import WeightRulerPicker from '@/components/WeightRulerPicker'
import { useWeightUnit } from '@/hooks/weight-unit-context'
import type { UserProfile, WeightRecord } from '@/types'
import { FEMALE_WEIGH_IN_TAGS, getDefaultNote, toggleTagInNote, WEIGH_IN_TAGS } from '@/utils/note'
import { getEarliestRecordDate, isRecordDateSelectable } from '@/utils/record-date'
import { toast } from '@/utils/toast'
import { isWeightOutlier } from '@/utils/validation'
import { formatWeight, formatWeightValue, WEIGHT_UNIT_LABEL } from '@/utils/weight-unit'

interface Props {
  profile: UserProfile
  records: WeightRecord[]
  onSave: (payload: { date: string; weight: number; note?: string }) => void
}

export default function AddRecordPage({ profile, records, onSave }: Props) {
  const { unit } = useWeightUnit()
  const [selectedDate, setSelectedDate] = useState(() => dayjs().format('YYYY-MM-DD'))
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const todayStr = dayjs().format('YYYY-MM-DD')
  const earliestDateStr = getEarliestRecordDate(todayStr)

  const existingRecord = records.find(r => r.date === selectedDate) ?? null
  const latestRecord = records.at(-1)

  const [weight, setWeight] = useState(() =>
    existingRecord ? existingRecord.weight : (latestRecord?.weight ?? profile.initialWeight),
  )
  const [note, setNote] = useState(() => {
    if (existingRecord?.note) return existingRecord.note
    return getDefaultNote(dayjs().hour())
  })
  // 标记当前备注是否仍为“自动带入”：
  // 已有记录的备注属于用户数据，输入框被手动编辑或点过 tag 也算用户改动。
  // 只有处于自动状态时，切换日期才允许刷新备注；用户自己写的内容不动。
  const [isNoteAuto, setIsNoteAuto] = useState(() => !existingRecord?.note)

  // 异常值二次确认：与“最近一次其它日期记录”相差过大时，先提示再保存
  const [pendingOutlier, setPendingOutlier] = useState(false)
  const referenceWeight = [...records].reverse().find(r => r.date !== selectedDate)?.weight ?? null
  const isOutlier = isWeightOutlier(weight, referenceWeight)

  // 体重值变化后，撤销待确认状态，让提示随新值重新评估
  const handleWeightChange = (next: number) => {
    setWeight(next)
    setPendingOutlier(false)
  }

  // 用户手动编辑备注（输入框或点 tag）后，标记为非自动
  const updateNoteByUser = (next: string) => {
    setNote(next)
    setIsNoteAuto(false)
  }

  const handleDateChange = (newDate: string) => {
    if (!isRecordDateSelectable(newDate, todayStr)) {
      toast.error('仅支持补录最近 1 个月内的记录')
      return
    }

    setSelectedDate(newDate)
    setPendingOutlier(false)
    const newExisting = records.find(r => r.date === newDate)
    if (newExisting) {
      setWeight(newExisting.weight)
      setNote(newExisting.note ?? '')
      setIsNoteAuto(!newExisting.note)
    } else {
      setWeight(latestRecord?.weight ?? profile.initialWeight)
      // 仅当备注仍是自动带入、用户没手写过时，才按新日期刷新
      if (isNoteAuto) {
        setNote(newDate === todayStr ? getDefaultNote(dayjs().hour()) : '')
      }
    }
  }

  const hasExistingRecord = Boolean(existingRecord)

  return (
    <div className="app-page bg-[var(--carbon-bg)]">
      <main className="app-main flex flex-col gap-8 px-4 pb-8 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-[28px] font-light tracking-tight text-[var(--carbon-text)]">
              记录体重
            </h2>
            <p className="text-sm text-[var(--carbon-text-secondary)]">记录您的身体变化</p>
            <p className="text-xs text-[var(--carbon-text-secondary)]">
              可补录范围：{dayjs(earliestDateStr).format('MM月DD日')} 至今天
            </p>
          </div>

          <button
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--carbon-text)] transition-colors hover:bg-[var(--carbon-surface-hover)]"
          >
            <span className="i-lucide-calendar-days h-3.5 w-3.5 text-[var(--carbon-text-secondary)]" />
            {selectedDate === todayStr ? '今天' : dayjs(selectedDate).format('MM月DD日')}
          </button>
        </div>

        <section className="pt-1">
          <div className="mb-4 flex items-baseline justify-center">
            <span className="text-[80px] font-light leading-none text-[var(--carbon-text)]">
              {formatWeightValue(weight, unit)}
            </span>
            <span className="ml-1 text-[20px] text-[var(--carbon-text-secondary)]">
              {WEIGHT_UNIT_LABEL[unit]}
            </span>
          </div>

          <WeightRulerPicker value={weight} onChange={handleWeightChange} />
        </section>

        {existingRecord ? (
          <section className="border-l-4 border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="i-lucide-info h-4 w-4 shrink-0 text-[var(--carbon-primary)]" />
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--carbon-primary)]">
                  该日期已有记录
                </p>
                <p className="text-sm leading-6 text-[var(--carbon-text)]">
                  当前已保存 {formatWeight(existingRecord.weight, unit)}。再次保存会覆盖旧记录。
                </p>
                {existingRecord.note ? (
                  <p className="text-xs leading-5 text-[var(--carbon-text-secondary)]">
                    备注：{existingRecord.note}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          <label
            htmlFor="weight-note"
            className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]"
          >
            备注（选填）
          </label>
          <TextInput
            id="weight-note"
            type="text"
            value={note}
            onChange={event => updateNoteByUser(event.target.value)}
            placeholder="早晨称重，运动后..."
            rightElement={<span className="i-lucide-notebook-pen h-5 w-5" />}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[...WEIGH_IN_TAGS, ...(profile.gender === 'female' ? FEMALE_WEIGH_IN_TAGS : [])].map(
              tag => {
                const isActive = note.split(' ').includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => updateNoteByUser(toggleTagInNote(note, tag))}
                    className={`border px-3 py-1.5 text-xs transition-colors ${
                      isActive
                        ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)] font-medium'
                        : 'border-[var(--carbon-border)] bg-[var(--carbon-surface)] text-[var(--carbon-text-secondary)] hover:bg-[var(--carbon-surface-variant)] active:bg-[var(--carbon-surface-active)]'
                    }`}
                  >
                    {tag}
                  </button>
                )
              },
            )}
          </div>
          <p className="text-xs leading-5 text-[var(--carbon-text-secondary)]">
            {hasExistingRecord
              ? '如果不修改备注，将保留当前输入框里的内容并覆盖旧备注。'
              : '备注会随这条体重记录一起保存，适合记录晨起、饭后或运动后等上下文。'}
          </p>
        </section>
      </main>

      <div className="mx-auto mt-6 flex flex-col gap-2 px-4">
        {/* 异常值提醒：与最近一次记录相差过大时，需再点一次确认 */}
        {pendingOutlier && referenceWeight !== null && (
          <div className="flex items-start gap-2 border-l-4 border-[var(--color-warning)] bg-[var(--carbon-surface-subtle)] px-3 py-2.5">
            <span className="i-lucide-triangle-alert mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
            <p className="text-xs leading-5 text-[var(--carbon-text)]">
              本次 {formatWeight(weight, unit)} 与最近一次记录（
              {formatWeight(referenceWeight, unit)}
              ）相差较大，确认没有输错吗？再点一次"确认保存"即可。
            </p>
          </div>
        )}
        <button
          onClick={() => {
            if (!isRecordDateSelectable(selectedDate, todayStr)) {
              toast.error('仅支持补录最近 1 个月内的记录')
              return
            }

            // 首次点击若判定为异常值，先要求二次确认，不直接保存
            if (isOutlier && !pendingOutlier) {
              setPendingOutlier(true)
              return
            }

            onSave({
              date: selectedDate,
              weight,
              note: note.trim() || undefined,
            })
          }}
          className={`group flex h-14 w-full items-center justify-center gap-2 px-6 text-base font-medium text-[var(--carbon-text-on-primary)] transition-colors ${
            pendingOutlier
              ? 'bg-[var(--color-warning)] hover:opacity-90'
              : 'bg-[var(--carbon-primary)] hover:bg-[var(--carbon-primary-hover)]'
          }`}
        >
          <span>{pendingOutlier ? '确认保存' : '保存记录'}</span>
          <span className="i-lucide-check h-4 w-4" />
        </button>
      </div>

      <CalendarModal
        key={`${selectedDate}-${isCalendarOpen ? 'open' : 'closed'}`}
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        records={records}
        selectedDate={selectedDate}
        onSelectDate={handleDateChange}
      />
    </div>
  )
}
