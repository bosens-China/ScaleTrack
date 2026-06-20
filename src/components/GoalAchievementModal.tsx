import confetti from 'canvas-confetti'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'

import { useWeightUnit } from '@/hooks/weight-unit-context'
import type { Goal } from '@/types'
import { generateShareImage, processShareOrDownload } from '@/utils/share'
import { toast } from '@/utils/toast'
import { formatWeightValue, toDisplayWeight, WEIGHT_UNIT_LABEL } from '@/utils/weight-unit'

interface Props {
  goal: Goal
  onClose: () => void
  onSetNew: () => void
}

/**
 * 目标达成庆祝弹窗
 * - 展示 confetti 动画
 * - 统计达成数据（用时天数、减/增重量、日均变化）
 * - 支持保存分享卡片为 PNG 图片
 */
export default function GoalAchievementModal({ goal, onClose, onSetNew }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const { unit } = useWeightUnit()
  const unitLabel = WEIGHT_UNIT_LABEL[unit]

  // 当日达成时 diff 为 0，兜底为 1 天，避免展示「0 天达成」（与里程碑详情页一致）
  const days = goal.completedDate
    ? dayjs(goal.completedDate).diff(dayjs(goal.startDate), 'day') || 1
    : 0
  const weightDiff = Math.abs(goal.startWeight - goal.targetWeight)
  const avgPerDay = days > 0 ? (toDisplayWeight(weightDiff, unit) / days).toFixed(2) : '0'
  const direction = goal.startWeight > goal.targetWeight ? '减' : '增'

  // 设了目标日期时，对比实际达成日，给出提前/准时/超期反馈
  let scheduleNote: string | null = null
  if (goal.targetDate && goal.completedDate) {
    const aheadDays = dayjs(goal.targetDate).diff(dayjs(goal.completedDate), 'day')
    if (aheadDays > 0) scheduleNote = `比计划提前 ${aheadDays} 天达成 🎯`
    else if (aheadDays === 0) scheduleNote = '正好如期达成 🎯'
    else scheduleNote = `比计划晚了 ${Math.abs(aheadDays)} 天，但你坚持到了最后`
  }

  const getEncouragement = () => {
    if (days <= 7) return '你的毅力令人钦佩！短短一周就达成了目标。'
    if (days <= 30) return '坚持就是胜利，你用行动证明了自己！'
    if (days <= 90) return '三个月的坚持更不容易，为自己骄傲！'
    return '长期坚持是最难的，你做到了，这就是自律的力量。'
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#10b981', '#14b8a6', '#f59e0b', '#06b6d4', '#f43f5e'],
        gravity: 0.8,
        scalar: 1.2,
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const handleSaveImage = async () => {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const url = await generateShareImage(cardRef.current)
      const filename = `scaletrack-achievement-${dayjs().format('YYYYMMDD')}.png`
      await processShareOrDownload(url, filename)
    } catch (err) {
      console.error(err)
      toast.error('图片保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 flex w-full max-w-sm flex-col bg-[var(--carbon-surface)] shadow-lg">
        {/* 分享卡片区域（用于截图） */}
        <div ref={cardRef} className="flex flex-col">
          <div className="flex flex-col items-center gap-2 bg-[var(--carbon-primary)] px-6 py-6 text-[var(--carbon-text-on-primary)]">
            <span className="i-lucide-trophy h-10 w-10" />
            <h2 className="text-xl font-semibold">目标达成！</h2>
            <p className="text-center text-sm text-white/80">
              {formatWeightValue(goal.startWeight, unit)} →{' '}
              {formatWeightValue(goal.targetWeight, unit)} {unitLabel}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-px border-b border-[var(--carbon-border)] bg-[var(--carbon-border)]">
            <div className="flex flex-col items-center gap-1 bg-[var(--carbon-surface)] py-4">
              <span className="text-xl font-semibold text-[var(--carbon-primary)]">{days}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--carbon-text-secondary)]">
                天
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-[var(--carbon-surface)] py-4">
              <span className="text-xl font-semibold text-[var(--carbon-primary)]">
                {formatWeightValue(weightDiff, unit)}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--carbon-text-secondary)]">
                {direction}重 ({unitLabel})
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-[var(--carbon-surface)] py-4">
              <span className="text-xl font-semibold text-[var(--carbon-primary)]">
                {avgPerDay}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--carbon-text-secondary)]">
                日均 ({unitLabel})
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-b border-[var(--carbon-border)] px-6 py-4">
            {scheduleNote && (
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--carbon-primary)]">
                <span className="i-lucide-calendar-check h-4 w-4 shrink-0" />
                <span>{scheduleNote}</span>
              </div>
            )}
            <div className="flex items-start gap-3 bg-[var(--carbon-surface-subtle)] p-3">
              <span className="i-lucide-sparkles h-4 w-4 shrink-0 text-[var(--carbon-primary)]" />
              <p className="text-sm leading-6 text-[var(--carbon-text)]">{getEncouragement()}</p>
            </div>
          </div>
        </div>

        {/* 操作按钮区域（不包含在截图中） */}
        <div className="flex flex-col gap-2 p-4">
          <button
            onClick={handleSaveImage}
            disabled={saving}
            className="flex h-10 items-center justify-center gap-2 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] text-sm font-medium text-[var(--carbon-text)] transition-colors hover:bg-[var(--carbon-surface-subtle)] disabled:opacity-50"
          >
            {saving ? (
              <span className="i-lucide-loader-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="i-lucide-share h-4 w-4" />
            )}
            {saving ? '正在生成...' : '分享或保存卡片'}
          </button>

          <button
            onClick={onSetNew}
            className="flex h-12 items-center justify-center gap-2 bg-[var(--carbon-primary)] text-sm font-semibold text-[var(--carbon-text-on-primary)] transition-colors hover:bg-[var(--carbon-primary-hover)]"
          >
            <span className="i-lucide-target h-4 w-4" />
            设定新目标
          </button>

          <button
            onClick={onClose}
            className="flex h-10 items-center justify-center text-sm text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]"
          >
            稍后再说
          </button>
        </div>
      </div>
    </div>
  )
}
