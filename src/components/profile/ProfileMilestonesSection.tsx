import dayjs from 'dayjs'

import type { Goal } from '../../types'

interface Props {
  milestones: Goal[]
}

export default function ProfileMilestonesSection({ milestones }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
        里程碑
      </h3>
      <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
        {milestones.length === 0 ? (
          <div className="px-4 py-5 text-sm leading-6 text-[var(--carbon-text-secondary)]">
            达成第一个目标后，这里会保留你的里程碑记录。
          </div>
        ) : (
          <div className="flex flex-col">
            {[...milestones].reverse().map(milestone => {
              const days = milestone.completedDate
                ? dayjs(milestone.completedDate).diff(dayjs(milestone.startDate), 'day')
                : 0
              const diff = Math.abs(milestone.startWeight - milestone.targetWeight).toFixed(1)
              const direction = milestone.startWeight > milestone.targetWeight ? '减' : '增'

              return (
                <div
                  key={milestone.id}
                  className="flex items-start gap-3 border-b border-[var(--carbon-border)] px-4 py-4 last:border-b-0"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)]">
                    <span className="i-lucide-trophy h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--carbon-text)]">
                      {milestone.startWeight.toFixed(1)} -&gt; {milestone.targetWeight.toFixed(1)}{' '}
                      kg
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--carbon-text-secondary)]">
                      {direction}重 {diff} kg · 用时 {days} 天
                    </p>
                    {milestone.completedDate ? (
                      <p className="mt-1 text-xs text-[var(--carbon-outline)]">
                        {dayjs(milestone.completedDate).format('YYYY/MM/DD')} 达成
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
