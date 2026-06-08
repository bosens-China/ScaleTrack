import { useState } from 'react'

import TextInput from '@/components/TextInput'

import type { Goal } from '@/types'
import { toast } from '@/utils/toast'
import { validateWeight } from '@/utils/validation'

interface Props {
  goal: Goal | null
  onSaveGoal: (targetWeight: number) => void
}

/** 目标区块自行管理编辑态，页面层只保留数据编排。 */
export default function ProfileGoalSection({ goal, onSaveGoal }: Props) {
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(goal?.targetWeight.toFixed(1) ?? '')

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
    <section className="flex flex-col gap-2 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
          目标体重
        </h3>
        <button onClick={handleToggleEdit} className="text-sm text-[var(--carbon-primary)]">
          {goal ? '调整' : '设置'}
        </button>
      </div>

      {!isEditingGoal && (
        <div className="mt-1">
          <p className="text-2xl font-light text-[var(--carbon-text)]">
            {goal ? `${goal.targetWeight.toFixed(1)} ` : '-- '}
            <span className="text-sm text-[var(--carbon-text-secondary)]">kg</span>
          </p>
        </div>
      )}

      {isEditingGoal && (
        <div className="flex flex-col gap-3 pt-3">
          <div className="flex items-center gap-3">
            <TextInput
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
              wrapperClassName="flex-1 !h-10"
              placeholder="例如：65.0"
            />
            <button
              onClick={handleSave}
              className="flex h-10 items-center justify-center bg-[var(--carbon-primary)] px-5 text-sm font-medium text-[var(--carbon-text-on-primary)] transition-colors hover:bg-[var(--carbon-primary-hover)]"
            >
              保存
            </button>
          </div>
          <p className="text-xs text-[var(--carbon-text-secondary)]">
            更新目标后，主页的进度追踪器会自动重置进度。
          </p>
        </div>
      )}
    </section>
  )
}
