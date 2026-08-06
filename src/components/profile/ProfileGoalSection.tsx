import { useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import dayjs from 'dayjs'

import FutureDatePickerModal from '@/components/FutureDatePickerModal'
import TextInput from '@/components/TextInput'

import { useWeightUnit } from '@/hooks/weight-unit-context'
import type { Goal } from '@/types'
import { classifyGainPace, classifyLossPace } from '@/utils/calorie-guidance'
import { isGoalOverdue } from '@/utils/goal-state'
import { toast } from '@/utils/toast'
import { validateWeight } from '@/utils/validation'
import { formatWeightValue, fromDisplayWeight, getWeightUnitLabel } from '@/utils/weight-unit'

interface Props {
  goal: Goal | null
  currentWeight: number
  /** 推荐目标体重（kg）：BMI 正常区间中值，作为“减/增多少合适”的锚点 */
  recommendedWeight: number
  onSaveGoal: (targetWeight: number, targetDate?: string) => void
  onAbandonGoal: () => void
}

/** 目标区块自行管理编辑态，页面层只保留数据编排。 */
export default function ProfileGoalSection({
  goal,
  currentWeight,
  recommendedWeight,
  onSaveGoal,
  onAbandonGoal,
}: Props) {
  const { t } = useI18n()
  const { unit } = useWeightUnit()
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(goal ? formatWeightValue(goal.targetWeight, unit) : '')
  const [targetDate, setTargetDate] = useState<string | undefined>(goal?.targetDate)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isConfirmingAbandon, setIsConfirmingAbandon] = useState(false)

  const today = dayjs().format('YYYY-MM-DD')
  const overdue = isGoalOverdue(goal, today)
  const unitLabel = getWeightUnitLabel(unit)

  // 推荐体重的展示字符串（按当前单位换算）
  const recommendedInput = formatWeightValue(recommendedWeight, unit)

  const handleToggleEdit = () => {
    // 还没有目标时，默认填入推荐体重，避免用户对“减/增多少”无从下手
    setGoalInput(goal ? formatWeightValue(goal.targetWeight, unit) : recommendedInput)
    setTargetDate(goal?.targetDate)
    setIsConfirmingAbandon(false)
    setIsEditingGoal(value => !value)
  }

  const handleSave = () => {
    const parsedDisplay = Number.parseFloat(goalInput)
    const parsed = fromDisplayWeight(parsedDisplay, unit)
    if (Number.isNaN(parsedDisplay) || !validateWeight(parsed)) {
      toast.error(t('请输入有效的目标体重'))
      return
    }

    // 起始体重沿用已有目标，否则取当前体重；目标等于起始会被立即判定达成，需拦截
    const referenceWeight = goal ? goal.startWeight : currentWeight
    if (parsed === referenceWeight) {
      toast.error(t('目标体重不能与起始体重相同'))
      return
    }

    // 设了目标日期时，对过快的计划速度给出健康软提醒（仍允许保存）
    if (targetDate) {
      const daysLeft = dayjs(targetDate).diff(dayjs(today), 'day')
      const remaining = Math.abs(referenceWeight - parsed)
      if (daysLeft > 0) {
        const weeklyKg = (remaining / daysLeft) * 7
        const isGain = parsed > referenceWeight
        const level = isGain
          ? classifyGainPace(weeklyKg)
          : classifyLossPace(weeklyKg, currentWeight)
        if (level === 'unsafe') {
          toast.info(
            t`目标节奏偏快（约 ${weeklyKg.toFixed(1)}kg/周），注意健康，循序渐进更稳妥`,
            3500,
          )
        }
      }
    }

    onSaveGoal(parsed, targetDate)
    setIsEditingGoal(false)
  }

  const handleAbandon = () => {
    onAbandonGoal()
    setIsConfirmingAbandon(false)
    setIsEditingGoal(false)
  }

  return (
    <section className="flex flex-col gap-2 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
          {t('目标体重')}
        </h3>
        <button onClick={handleToggleEdit} className="text-sm text-[var(--carbon-primary)]">
          {isEditingGoal ? t('收起') : goal ? t('调整') : t('设置')}
        </button>
      </div>

      {!isEditingGoal && (
        <div className="mt-1 flex flex-col gap-1">
          <p className="text-2xl font-light text-[var(--carbon-text)]">
            {goal ? `${formatWeightValue(goal.targetWeight, unit)} ` : '-- '}
            <span className="text-sm text-[var(--carbon-text-secondary)]">{unitLabel}</span>
          </p>
          {goal?.targetDate && (
            <p
              className={`flex items-center gap-1 text-xs ${overdue ? 'text-[var(--color-warning)]' : 'text-[var(--carbon-text-secondary)]'}`}
            >
              <span className="i-lucide-calendar-clock h-3.5 w-3.5" />
              {t`期望达成：${dayjs(goal.targetDate).format('YYYY/MM/DD')}`}
              {overdue && t(' · 已过期')}
            </p>
          )}
        </div>
      )}

      {/* 过期提醒横幅：引导用户延期或放弃，避免目标无限期挂着 */}
      {!isEditingGoal && overdue && !isConfirmingAbandon && (
        <div className="mt-2 flex flex-col gap-2 border-l-2 border-[var(--color-warning)] bg-[var(--carbon-surface-subtle)] px-3 py-2.5">
          <p className="text-xs leading-5 text-[var(--carbon-text)]">
            {t('目标日期已过但尚未达成，可以延长日期、重设目标，或放弃这个目标。')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleToggleEdit}
              className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-3 py-1 text-xs font-medium text-[var(--carbon-text)] transition-colors hover:bg-[var(--carbon-surface-variant)]"
            >
              {t('延期 / 调整')}
            </button>
            <button
              onClick={() => setIsConfirmingAbandon(true)}
              className="px-3 py-1 text-xs text-[var(--carbon-text-secondary)] transition-colors hover:text-[var(--color-danger)]"
            >
              {t('放弃目标')}
            </button>
          </div>
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
              placeholder={t`目标体重（${unitLabel}）`}
            />
            <button
              onClick={handleSave}
              className="flex h-10 items-center justify-center bg-[var(--carbon-primary)] px-5 text-sm font-medium text-[var(--carbon-text-on-primary)] transition-colors hover:bg-[var(--carbon-primary-hover)]"
            >
              {t('保存')}
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
                  ? t`期望达成 ${dayjs(targetDate).format('YYYY/MM/DD')}`
                  : t('设置期望达成日期（选填）')}
              </span>
              <span className="i-lucide-calendar-clock h-4 w-4 text-[var(--carbon-text-secondary)]" />
            </button>
            {targetDate && (
              <button
                type="button"
                onClick={() => setTargetDate(undefined)}
                className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--carbon-text-secondary)] transition-colors hover:text-[var(--color-danger)]"
                aria-label={t('清除目标日期')}
              >
                <span className="i-lucide-x h-4 w-4" />
              </button>
            )}
          </div>

          {/* 推荐体重：BMI 正常区间中值，点一下即可填入 */}
          <button
            type="button"
            onClick={() => setGoalInput(recommendedInput)}
            className="flex items-center gap-1.5 self-start rounded-full border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] px-3 py-1.5 text-xs text-[var(--carbon-text-secondary)] transition-colors hover:border-[var(--carbon-primary)] hover:text-[var(--carbon-primary)]"
          >
            <span className="i-lucide-sparkles h-3.5 w-3.5 text-[var(--carbon-primary)]" />
            {t`推荐 ${recommendedInput} ${unitLabel}（BMI 正常中值）`}
          </button>

          <p className="text-xs text-[var(--carbon-text-secondary)]">
            {t('更新目标后，主页的进度追踪器会自动重置进度。')}
          </p>

          {/* 放弃当前目标入口 */}
          {goal &&
            (isConfirmingAbandon ? (
              <div className="flex items-center justify-between border-t border-[var(--color-danger)] pt-3">
                <p className="text-xs text-[var(--carbon-text-secondary)]">
                  {t('放弃后该目标不会归档到里程碑，确认放弃？')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsConfirmingAbandon(false)}
                    className="px-3 py-1 text-xs text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]"
                  >
                    {t('取消')}
                  </button>
                  <button
                    onClick={handleAbandon}
                    className="bg-[var(--color-danger)] px-3 py-1 text-xs font-medium text-white"
                  >
                    {t('放弃')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingAbandon(true)}
                className="flex items-center gap-1.5 self-start text-xs text-[var(--carbon-text-secondary)] transition-colors hover:text-[var(--color-danger)]"
              >
                <span className="i-lucide-trash-2 h-3.5 w-3.5" />
                {t('放弃当前目标')}
              </button>
            ))}
        </div>
      )}

      {/* 非编辑态下的放弃确认（来自概览态或过期横幅触发） */}
      {!isEditingGoal && goal && isConfirmingAbandon && (
        <div className="mt-2 flex items-center justify-between border-t border-[var(--color-danger)] pt-3">
          <p className="text-xs text-[var(--carbon-text-secondary)]">{t('确认放弃当前目标？')}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsConfirmingAbandon(false)}
              className="px-3 py-1 text-xs text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]"
            >
              {t('取消')}
            </button>
            <button
              onClick={handleAbandon}
              className="bg-[var(--color-danger)] px-3 py-1 text-xs font-medium text-white"
            >
              {t('放弃')}
            </button>
          </div>
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
