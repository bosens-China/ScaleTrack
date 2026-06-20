import dayjs from 'dayjs'

import { useWeightUnit } from '@/hooks/weight-unit-context'
import type { AppPage, Goal } from '@/types'
import { formatWeightValue, WEIGHT_UNIT_LABEL } from '@/utils/weight-unit'

interface Props {
  milestones: Goal[]
  onNavigate: (page: AppPage) => void
  onSelectMilestone: (id: string) => void
}

export default function ProfileMilestonesSection({ milestones, onSelectMilestone }: Props) {
  const { unit } = useWeightUnit()
  const unitLabel = WEIGHT_UNIT_LABEL[unit]
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
                ? dayjs(milestone.completedDate).diff(dayjs(milestone.startDate), 'day') || 1
                : 0
              const diff = formatWeightValue(
                Math.abs(milestone.startWeight - milestone.targetWeight),
                unit,
              )
              const direction = milestone.startWeight > milestone.targetWeight ? '减' : '增'

              return (
                <div
                  key={milestone.id}
                  onClick={() => onSelectMilestone(milestone.id)}
                  className="group flex cursor-pointer items-start justify-between border-b border-[var(--carbon-border)] px-4 py-4 transition-colors hover:bg-[var(--carbon-surface-subtle)] last:border-b-0"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)]">
                      <span className="i-lucide-trophy h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--carbon-text)]">
                        {formatWeightValue(milestone.startWeight, unit)} -&gt;{' '}
                        {formatWeightValue(milestone.targetWeight, unit)} {unitLabel}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--carbon-text-secondary)]">
                        {direction}重 {diff} {unitLabel} · 用时 {days} 天
                      </p>
                      {milestone.completedDate ? (
                        <p className="mt-1 text-xs text-[var(--carbon-outline)]">
                          {dayjs(milestone.completedDate).format('YYYY/MM/DD')} 达成
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 text-[var(--carbon-outline)] transition-colors group-hover:text-[var(--carbon-primary)]">
                    <span className="i-lucide-chevron-right h-5 w-5" />
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
