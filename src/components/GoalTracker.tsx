import dayjs from 'dayjs'
import { useCallback, useState } from 'react'
import type { Goal } from '../types'
import { getActiveGoal, saveGoal } from '../utils/storage'
import { validateWeight } from '../utils/validation'

interface Props {
  currentWeight: number
  onGoalSet: () => void
}

export default function GoalTracker({ currentWeight, onGoalSet }: Props) {
  const activeGoal = getActiveGoal()
  const [showForm, setShowForm] = useState(false)
  const [target, setTarget] = useState('')

  const handleSetGoal = useCallback(() => {
    const t = parseFloat(target)
    if (!validateWeight(t)) return

    const goal: Goal = {
      id: crypto.randomUUID(),
      targetWeight: t,
      startWeight: currentWeight,
      startDate: dayjs().format('YYYY-MM-DD'),
      isCompleted: false,
    }
    saveGoal(goal)
    setTarget('')
    setShowForm(false)
    onGoalSet()
  }, [target, currentWeight, onGoalSet, setTarget, setShowForm])

  if (activeGoal) {
    const progress =
      (Math.abs(currentWeight - activeGoal.startWeight) /
        Math.abs(activeGoal.targetWeight - activeGoal.startWeight)) *
      100
    const clampedProgress = Math.min(100, Math.max(0, progress))
    const remaining = Math.abs(currentWeight - activeGoal.targetWeight).toFixed(1)
    const isOnTrack =
      (activeGoal.startWeight > activeGoal.targetWeight &&
        currentWeight <= activeGoal.startWeight) ||
      (activeGoal.startWeight < activeGoal.targetWeight && currentWeight >= activeGoal.startWeight)

    return (
      <div className="card p-5 shadow-lg shadow-[var(--c-card-shadow)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-500/10 flex items-center justify-center">
              <span className="i-lucide-target text-accent-600 w-4 h-4" />
            </div>
            <h2 className="font-sans font-semibold text-[var(--c-text)]">目标</h2>
          </div>
          <span className="text-xs text-[var(--c-text-secondary)]">
            {dayjs(activeGoal.startDate).format('MM/DD')} 开始
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-4">
          <span className="font-sans text-[28px] font-extrabold leading-none text-primary-600">
            {activeGoal.targetWeight}
          </span>
          <span className="text-sm text-[var(--c-text-secondary)]">kg</span>
          <span className="text-sm text-[var(--c-text-secondary)] ml-2">还差 {remaining} kg</span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-[var(--c-bg-secondary)] rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${clampedProgress}%`,
              background: isOnTrack
                ? 'linear-gradient(90deg, #10b981, #14b8a6)'
                : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            }}
          />
        </div>
        <div className="text-xs text-[var(--c-text-secondary)] text-right font-medium">
          {clampedProgress.toFixed(0)}%
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5 shadow-lg shadow-[var(--c-card-shadow)]">
      {showForm ? (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent-500/10 flex items-center justify-center">
              <span className="i-lucide-target text-accent-600 text-sm" />
            </div>
            <h2 className="font-sans font-semibold text-[var(--c-text)]">设定目标</h2>
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              inputMode="decimal"
              placeholder="目标体重 (kg)"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="input flex-1 text-sm"
            />
            <button onClick={handleSetGoal} className="btn-primary px-5 text-sm">
              确定
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline px-4 text-sm">
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-[var(--c-border)] hover:border-primary-400/40 hover:bg-primary-500/3 hover:text-primary-600 rounded-2xl py-3 text-[var(--c-text-secondary)] transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <span className="i-lucide-target text-sm shrink-0" />
          <span className="text-xs font-body font-bold uppercase tracking-wider">设定体重目标</span>
        </button>
      )}
    </div>
  )
}
