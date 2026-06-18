import { useState } from 'react'

import dayjs from 'dayjs'

import FutureDatePickerModal from '@/components/FutureDatePickerModal'
import TextInput from '@/components/TextInput'

import type { Goal } from '@/types'
import { toast } from '@/utils/toast'
import { validateWeight } from '@/utils/validation'

interface Props {
  goal: Goal | null
  currentWeight: number
  onSaveGoal: (targetWeight: number, targetDate?: string) => void
}

/** 目标区块自行管理编辑态，页面层只保留数据编排。 */
export default function ProfileGoalSection({ goal, currentWeight, onSaveGoal }: Props) {
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(goal?.targetWeight.toFixed(1) ?? '')
  const [targetDate, setTargetDate] = useState<string | undefined>(goal?.targetDate)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const handleToggleEdit = () => {
    setGoalInput(goal?.targetWeight.toFixed(1) ?? '')
    setTargetDate(goal?.targetDate)
    setIsEditingGoal(value => !value)
  }

  const handleSave = () => {
    const parsed = Number.parseFloat(goalInput)
    if (!validateWeight(parsed)) {
      toast.error('请输入有效的目标体重')
      return
    }

    // 起始体重沿用已有目标，否则取当前体重；目标等于起始会被立即判定达成，需拦截
    const referenceWeight = goal ? goal.startWeight : currentWeight
    if (parsed === referenceWeight) {
      toast.error('目标体重不能与起始体重相同')
      return
    }

    onSaveGoal(parsed, targetDate)
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
        <div className="mt-1 flex flex-col gap-1">
          <p className="text-2xl font-light text-[var(--carbon-text)]">
            {goal ? `${goal.targetWeight.toFixed(1)} ` : '-- '}
            <span className="text-sm text-[var(--carbon-text-secondary)]">kg</span>
          </p>
          {goal?.targetDate && (
            <p className="flex items-center gap-1 text-xs text-[var(--carbon-text-secondary)]">
              <span className="i-lucide-calendar-clock h-3.5 w-3.5" />
              期望达成：{dayjs(goal.targetDate).format('YYYY年MM月DD日')}
            </p>
          )}
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="flex h-10 flex-1 items-center justify-between border border-[var(--carbon-border)] bg-[var(--carbon-bg)] px-3 text-sm transition-colors hover:bg-[var(--carbon-surface-variant)]"
            >
              <span
                className={
                  targetDate ? 'text-[var(--carbon-text)]' : 'text-[var(--carbon-text-secondary)]'
                }
              >
                {targetDate
                  ? `期望达成 ${dayjs(targetDate).format('YYYY/MM/DD')}`
                  : '设置期望达成日期（选填）'}
              </span>
              <span className="i-lucide-calendar-clock h-4 w-4 text-[var(--carbon-text-secondary)]" />
            </button>
            {targetDate && (
              <button
                type="button"
                onClick={() => setTargetDate(undefined)}
                className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--carbon-text-secondary)] transition-colors hover:text-[var(--color-danger)]"
                aria-label="清除目标日期"
              >
                <span className="i-lucide-x h-4 w-4" />
              </button>
            )}
          </div>

          <p className="text-xs text-[var(--carbon-text-secondary)]">
            更新目标后，主页的进度追踪器会自动重置进度。
          </p>
        </div>
      )}

      <FutureDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        value={targetDate}
        onSelect={setTargetDate}
      />
    </section>
  )
}
