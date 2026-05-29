import dayjs from 'dayjs'
import type { Goal } from '../types'

interface Props {
  milestones: Goal[]
}

export default function MilestoneList({ milestones }: Props) {
  if (milestones.length === 0) return null

  return (
    <div className="card p-5 shadow-lg shadow-[var(--c-card-shadow)]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-accent-500/10 flex items-center justify-center">
          <span className="i-lucide-trophy text-accent-600 text-sm" />
        </div>
        <h2 className="font-sans font-semibold text-[var(--c-text)]">里程碑</h2>
      </div>

      <div className="space-y-2.5">
        {milestones.map(m => {
          const days = m.completedDate ? dayjs(m.completedDate).diff(dayjs(m.startDate), 'day') : 0
          const diff = Math.abs(m.startWeight - m.targetWeight).toFixed(1)
          const direction = m.startWeight > m.targetWeight ? '减' : '增'

          return (
            <div
              key={m.id}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--c-bg-secondary)]"
            >
              <div className="w-9 h-9 rounded-xl bg-accent-500/10 flex items-center justify-center shrink-0">
                <span className="i-lucide-medal text-accent-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--c-text)]">
                  {m.startWeight} → {m.targetWeight} kg
                </div>
                <div className="text-xs text-[var(--c-text-secondary)] mt-0.5">
                  {direction}重 {diff} kg · 用时 {days} 天
                  {m.completedDate && ` · ${dayjs(m.completedDate).format('YYYY/MM/DD')} 达成`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
