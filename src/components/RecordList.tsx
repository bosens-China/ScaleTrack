import dayjs from 'dayjs'
import { useState } from 'react'
import type { WeightRecord } from '../types'
import { BMI_RANGES, getBMICategory, getBMIColor } from '../utils/bmi'
import { deleteRecord } from '../utils/storage'

interface Props {
  records: WeightRecord[]
  onDelete: () => void
}

export default function RecordList({ records, onDelete }: Props) {
  const [showAll, setShowAll] = useState(false)
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  const display = showAll ? sorted : sorted.slice(0, 5)

  const handleDelete = (id: string) => {
    deleteRecord(id)
    onDelete()
  }

  if (records.length === 0) return null

  return (
    <div className="card p-5 shadow-lg shadow-[var(--c-card-shadow)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <span className="i-lucide-list text-primary-600 text-sm" />
          </div>
          <h2 className="font-sans font-semibold text-[var(--c-text)]">记录</h2>
        </div>
        <span className="text-xs text-[var(--c-text-secondary)] font-medium">
          共 {records.length} 条
        </span>
      </div>

      <div className="space-y-2">
        {display.map((r, i) => {
          const prev = sorted[i + 1]
          const diff = prev ? (r.weight - prev.weight).toFixed(1) : null
          const cat = getBMICategory(r.bmi)
          const color = getBMIColor(r.bmi)
          const label = BMI_RANGES.find(b => b.category === cat)?.label ?? ''

          return (
            <div
              key={r.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--c-bg-secondary)] group hover:bg-[var(--c-border)]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-9 rounded-full" style={{ backgroundColor: color }} />
                <div>
                  <div className="text-sm font-semibold text-[var(--c-text)]">
                    {r.weight} kg
                    <span className="ml-2 text-xs font-medium" style={{ color }}>
                      {label} {r.bmi}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--c-text-secondary)] mt-0.5">
                    {dayjs(r.date).format('YYYY/MM/DD')}
                    {diff !== null && (
                      <span
                        className={
                          parseFloat(diff) > 0
                            ? 'text-danger'
                            : parseFloat(diff) < 0
                              ? 'text-success'
                              : ''
                        }
                      >
                        {' '}
                        {parseFloat(diff) > 0 ? `+${diff}` : diff} kg
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="opacity-0 group-hover:opacity-100 text-[var(--c-text-secondary)] hover:text-danger transition-all cursor-pointer p-2 rounded-lg hover:bg-danger/10"
                aria-label="删除"
              >
                <span className="i-lucide-trash-2 text-sm" />
              </button>
            </div>
          )
        })}
      </div>

      {sorted.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 text-xs text-primary-600 hover:text-primary-700 text-center cursor-pointer font-medium py-2"
        >
          {showAll ? '收起' : `查看全部 ${sorted.length} 条`}
        </button>
      )}
    </div>
  )
}
