import { useState } from 'react'

import type { Goal } from '../../types'
import { toast } from '../../utils/toast'
import { validateWeight } from '../../utils/validation'

interface GoalProgress {
  progress: number
  remaining: number
}

interface Props {
  goal: Goal | null
  currentWeight: number
  progress: GoalProgress | null
  onSaveGoal: (targetWeight: number) => void
}

/** 目标区块自行管理编辑态，页面层只保留数据编排。 */
export default function ProfileGoalSection({ goal, currentWeight, progress, onSaveGoal }: Props) {
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(goal?.targetWeight.toFixed(1) ?? '')
  // 判断当前目标方向
  const isGainGoal = goal !== null && goal.targetWeight > goal.startWeight

  const handleToggleEdit = () => {
    setGoalInput(goal?.targetWeight.toFixed(1) ?? '')
    setIsEditingGoal(value => !value)
  }

  const handleSave = () => {
    const parsed = Number.parseFloat(goalInput)
    if (!validateWeight(parsed)) {
      toast.error('请输入有效的目标体重')
      return
    }

    onSaveGoal(parsed)
    setIsEditingGoal(false)
  }

  return (
    <section className="flex flex-col gap-4 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4">
      <div className="flex items-center justify-between border-b border-[var(--carbon-border)] pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
          目标设置
        </h3>
        <button onClick={handleToggleEdit} className="text-sm text-[var(--carbon-primary)]">
          {goal ? '调整' : '设置'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden border border-[var(--carbon-border)] bg-[var(--carbon-border)]">
        <div className="bg-[var(--carbon-surface)] p-4">
          <p className="text-xs text-[var(--carbon-text-secondary)]">当前体重</p>
          <p className="mt-1 text-2xl font-light text-[var(--carbon-primary)]">
            {currentWeight.toFixed(1)} <span className="text-sm">kg</span>
          </p>
        </div>
        <div className="bg-[var(--carbon-surface)] p-4">
          <p className="text-xs text-[var(--carbon-text-secondary)]">目标体重</p>
          <p className="mt-1 text-2xl font-light text-[var(--carbon-text-secondary)]">
            {goal ? `${goal.targetWeight.toFixed(1)} ` : '-- '}
            <span className="text-sm">kg</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-xs text-[var(--carbon-text-secondary)]">
          <span>{isGainGoal ? '增肌进度' : '减重进度'}</span>
          <span className="font-semibold text-[var(--carbon-primary)]">
            {progress ? `${progress.progress}%` : '未设置'}
          </span>
        </div>
        <div className="h-1 w-full bg-[var(--carbon-surface-strong)]">
          <div
            className="h-full bg-[var(--carbon-primary)] transition-all duration-300"
            style={{ width: `${progress?.progress ?? 0}%` }}
          />
        </div>
        {progress && (
          <p className="text-[11px] text-[var(--carbon-text-secondary)]">
            还差{' '}
            <span className="font-semibold text-[var(--carbon-text)]">{progress.remaining} kg</span>{' '}
            到达目标
          </p>
        )}
      </div>

      {isEditingGoal ? (
        <div className="flex flex-col gap-3 border-t border-[var(--carbon-border)] pt-4">
          <label className="text-xs uppercase tracking-[0.16em] text-[var(--carbon-text-secondary)]">
            新目标体重
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              inputMode="decimal"
              value={goalInput}
              onChange={event => setGoalInput(event.target.value)}
              onFocus={event =>
                setTimeout(
                  () => event.target.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                  300,
                )
              }
              className="h-12 flex-1 border-b border-[var(--carbon-outline)] bg-[var(--carbon-surface-subtle)] px-4 text-sm outline-none focus:border-[var(--carbon-primary)]"
              placeholder="例如：65.0"
            />
            <button
              onClick={handleSave}
              className="bg-[var(--carbon-primary)] px-5 text-sm font-medium text-[var(--carbon-text-on-primary)] hover:bg-[var(--carbon-primary-hover)]"
            >
              保存
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
