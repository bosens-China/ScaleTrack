import dayjs from 'dayjs'
import { useState } from 'react'

import WeightRulerPicker from '../components/WeightRulerPicker'
import type { WeightRecord } from '../types'

interface Props {
  initialWeight: number
  existingRecord?: WeightRecord | null
  onSave: (payload: { date: string; weight: number; note?: string }) => void
}

export default function AddRecordPage({ initialWeight, existingRecord, onSave }: Props) {
  const [weight, setWeight] = useState(Number(initialWeight.toFixed(1)))
  const [note, setNote] = useState(() => {
    if (existingRecord?.note) return existingRecord.note
    const hour = dayjs().hour()
    if (hour >= 5 && hour < 10) return '早上'
    if (hour >= 10 && hour < 14) return '中午'
    if (hour >= 14 && hour < 19) return '下午'
    return '晚上'
  })
  const todayLabel = dayjs().format('YYYY年MM月DD日')
  const hasExistingRecord = Boolean(existingRecord)

  return (
    <div className="app-page bg-[var(--carbon-bg)]">
      <main className="app-main flex flex-col gap-8 px-4 pb-8 pt-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-[28px] font-light tracking-tight text-[var(--carbon-text)]">
            记录体重
          </h2>
          <p className="text-sm text-[var(--carbon-text-secondary)]">记录您的身体变化</p>
        </div>

        <section className="pt-1">
          <div className="mb-4 flex items-baseline justify-center">
            <span className="text-[80px] font-light leading-none text-[var(--carbon-text)]">
              {weight.toFixed(1)}
            </span>
            <span className="ml-1 text-[20px] text-[var(--carbon-text-secondary)]">kg</span>
          </div>

          <WeightRulerPicker value={weight} onChange={setWeight} />

          <p className="mt-3 text-center text-xs text-[var(--carbon-text-secondary)]">
            记录日期：{todayLabel}
          </p>
        </section>

        {existingRecord ? (
          <section className="border-l-4 border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="i-lucide-info h-4 w-4 shrink-0 text-[var(--carbon-primary)]" />
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--carbon-primary)]">
                  今日已有记录
                </p>
                <p className="text-sm leading-6 text-[var(--carbon-text)]">
                  当前已保存 {existingRecord.weight.toFixed(1)} kg。再次保存会覆盖今天的记录。
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
          <div className="relative border-b border-[var(--carbon-outline)] transition-colors focus-within:border-[var(--carbon-primary)]">
            <input
              id="weight-note"
              type="text"
              value={note}
              onChange={event => setNote(event.target.value)}
              placeholder="早晨称重，运动后..."
              className="h-12 w-full border-none bg-[var(--carbon-surface-subtle)] px-4 pr-11 text-sm text-[var(--carbon-text)] outline-none placeholder:text-[var(--carbon-text-secondary)]"
            />
            <span className="i-lucide-notebook-pen pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--carbon-text-secondary)]" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {['晨起空腹', '饭后', '运动后', '睡前'].map(tag => (
              <button
                key={tag}
                onClick={() => setNote(prev => (prev ? `${prev} ${tag}` : tag))}
                className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-3 py-1.5 text-xs text-[var(--carbon-text-secondary)] transition-colors hover:bg-[var(--carbon-surface-variant)] active:bg-[var(--carbon-surface-active)]"
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs leading-5 text-[var(--carbon-text-secondary)]">
            {hasExistingRecord
              ? '如果不修改备注，将保留当前输入框里的内容并覆盖今天的旧备注。'
              : '备注会随这条体重记录一起保存，适合记录晨起、饭后或运动后等上下文。'}
          </p>
        </section>
      </main>

      <div className="sticky bottom-[calc(60px+var(--safe-bottom))] mx-auto mt-6 bg-[var(--carbon-bg)] px-4 pt-4">
        <button
          onClick={() =>
            onSave({
              date: dayjs().format('YYYY-MM-DD'),
              weight,
              note: note.trim() || undefined,
            })
          }
          className="group flex h-16 w-full items-center justify-between bg-[var(--carbon-primary)] px-6 text-base font-medium text-[var(--carbon-text-on-primary)] transition-colors hover:bg-[var(--carbon-primary-hover)]"
        >
          <span>保存记录</span>
          <span className="i-lucide-check h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
