import dayjs from 'dayjs'
import { useState } from 'react'

import CalendarModal from '@/components/CalendarModal'
import TextInput from '@/components/TextInput'
import WeightRulerPicker from '@/components/WeightRulerPicker'
import type { UserProfile, WeightRecord } from '@/types'
import { getDefaultNote, toggleTagInNote } from '@/utils/note'

interface Props {
  profile: UserProfile
  records: WeightRecord[]
  onSave: (payload: { date: string; weight: number; note?: string }) => void
}

export default function AddRecordPage({ profile, records, onSave }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => dayjs().format('YYYY-MM-DD'))
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const todayStr = dayjs().format('YYYY-MM-DD')

  const existingRecord = records.find(r => r.date === selectedDate) ?? null
  const latestRecord = records.at(-1)

  const [weight, setWeight] = useState(() =>
    existingRecord ? existingRecord.weight : (latestRecord?.weight ?? profile.initialWeight),
  )
  const [note, setNote] = useState(() => {
    if (existingRecord?.note) return existingRecord.note
    return getDefaultNote(latestRecord, dayjs().hour())
  })

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    const newExisting = records.find(r => r.date === newDate)
    if (newExisting) {
      setWeight(newExisting.weight)
      setNote(newExisting.note ?? '')
    } else {
      setWeight(latestRecord?.weight ?? profile.initialWeight)
      if (newDate === todayStr) {
        setNote(getDefaultNote(latestRecord, dayjs().hour()))
      } else {
        setNote('')
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
              {weight.toFixed(1)}
            </span>
            <span className="ml-1 text-[20px] text-[var(--carbon-text-secondary)]">kg</span>
          </div>

          <WeightRulerPicker value={weight} onChange={setWeight} />
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
                  当前已保存 {existingRecord.weight.toFixed(1)} kg。再次保存会覆盖旧记录。
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
            onChange={event => setNote(event.target.value)}
            placeholder="早晨称重，运动后..."
            rightElement={<span className="i-lucide-notebook-pen h-5 w-5" />}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              '晨起空腹',
              '便后',
              '饭前',
              '饭后',
              '运动后',
              '大餐后',
              '睡前',
              ...(profile.gender === 'female' ? ['生理期'] : []),
            ].map(tag => {
              const isActive = note.split(' ').includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => setNote(prev => toggleTagInNote(prev, tag))}
                  className={`border px-3 py-1.5 text-xs transition-colors ${
                    isActive
                      ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)] font-medium'
                      : 'border-[var(--carbon-border)] bg-[var(--carbon-surface)] text-[var(--carbon-text-secondary)] hover:bg-[var(--carbon-surface-variant)] active:bg-[var(--carbon-surface-active)]'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
          <p className="text-xs leading-5 text-[var(--carbon-text-secondary)]">
            {hasExistingRecord
              ? '如果不修改备注，将保留当前输入框里的内容并覆盖旧备注。'
              : '备注会随这条体重记录一起保存，适合记录晨起、饭后或运动后等上下文。'}
          </p>
        </section>
      </main>

      <div className="mx-auto mt-6 px-4">
        <button
          onClick={() =>
            onSave({
              date: selectedDate,
              weight,
              note: note.trim() || undefined,
            })
          }
          className="group flex h-14 w-full items-center justify-center gap-2 bg-[var(--carbon-primary)] px-6 text-base font-medium text-[var(--carbon-text-on-primary)] transition-colors hover:bg-[var(--carbon-primary-hover)]"
        >
          <span>保存记录</span>
          <span className="i-lucide-check h-4 w-4" />
        </button>
      </div>

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        records={records}
        selectedDate={selectedDate}
        onSelectDate={handleDateChange}
      />
    </div>
  )
}
