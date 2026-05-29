import dayjs from 'dayjs'
import { useId, useState } from 'react'
import type { UserProfile, WeightRecord } from '../types'
import { calcBMI } from '../utils/bmi'
import { saveRecord } from '../utils/storage'

interface Props {
  profile: UserProfile
  onSaved: (record: WeightRecord) => void
  lastRecord?: WeightRecord | null
}

export default function RecordForm({ profile, onSaved, lastRecord }: Props) {
  const dateId = useId()
  const weightId = useId()
  const today = dayjs().format('YYYY-MM-DD')
  const [date, setDate] = useState(today)
  const [weight, setWeight] = useState('')

  const handleSave = () => {
    const w = parseFloat(weight)
    if (!w || w < 20 || w > 300) return

    const record: WeightRecord = {
      id: crypto.randomUUID(),
      date,
      weight: w,
      bmi: calcBMI(w, profile.height),
      createdAt: new Date().toISOString(),
    }
    saveRecord(record)
    onSaved(record)
    setWeight('')
  }

  const diff = lastRecord && weight ? (parseFloat(weight) - lastRecord.weight).toFixed(1) : null

  return (
    <div className="card p-5 shadow-lg shadow-[var(--c-card-shadow)]">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
          <span className="i-lucide-plus text-primary-600 text-sm" />
        </div>
        <h2 className="font-sans font-semibold text-stone-850 dark:text-stone-100 text-sm">
          记录体重
        </h2>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label
            htmlFor={dateId}
            className="block text-[10px] font-body font-bold text-[var(--c-text-secondary)] mb-1.5 uppercase tracking-wider"
          >
            日期
          </label>
          <input
            id={dateId}
            type="date"
            value={date}
            max={today}
            onChange={e => setDate(e.target.value)}
            className="input text-xs"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor={weightId}
            className="block text-[10px] font-body font-bold text-[var(--c-text-secondary)] mb-1.5 uppercase tracking-wider"
          >
            体重 (kg)
          </label>
          <input
            id={weightId}
            type="number"
            inputMode="decimal"
            placeholder={lastRecord ? String(lastRecord.weight) : '体重'}
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="input text-xs"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSave}
            disabled={!weight || parseFloat(weight) < 20}
            className="btn-primary px-5 text-xs font-semibold py-3 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            保存
          </button>
        </div>
      </div>

      {diff !== null && weight && (
        <div
          className={`mt-3 text-xs font-medium font-body animate-fade-in ${parseFloat(diff) > 0 ? 'text-danger' : parseFloat(diff) < 0 ? 'text-success' : 'text-[var(--c-text-secondary)]'}`}
        >
          较上次 {parseFloat(diff) > 0 ? `+${diff}` : diff} kg
        </div>
      )}
    </div>
  )
}
