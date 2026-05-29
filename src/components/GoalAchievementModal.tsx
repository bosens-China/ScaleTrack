import confetti from 'canvas-confetti'
import dayjs from 'dayjs'
import { toPng } from 'html-to-image'
import { useEffect, useRef, useState } from 'react'
import type { Goal } from '../types'

interface Props {
  goal: Goal
  onClose: () => void
  onSetNew: () => void
}

export default function GoalAchievementModal({ goal, onClose, onSetNew }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)

  const days = goal.completedDate ? dayjs(goal.completedDate).diff(dayjs(goal.startDate), 'day') : 0
  const weightDiff = Math.abs(goal.startWeight - goal.targetWeight)
  const avgPerDay = days > 0 ? (weightDiff / days).toFixed(2) : '0'
  const direction = goal.startWeight > goal.targetWeight ? '减' : '增'

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
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      })
      const link = document.createElement('a')
      link.download = `scaletrack-achievement-${dayjs().format('YYYYMMDD')}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to save image:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-content w-full max-w-sm">
        {/* Shareable Card */}
        <div
          ref={cardRef}
          className="bg-white rounded-3xl overflow-hidden"
          style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
        >
          {/* Header gradient */}
          <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5" />

            <div className="relative z-10 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="i-lucide-trophy text-2xl" />
              </div>
              <h2 className="text-xl font-bold mb-1">目标达成！</h2>
              <p className="text-sm text-white/80">
                ScaleTrack · {dayjs().format('YYYY年MM月DD日')}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center p-3 rounded-2xl bg-stone-50">
                <div className="text-2xl font-extrabold text-primary-600">{days}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">天</div>
              </div>
              <div className="text-center p-3 rounded-2xl bg-stone-50">
                <div className="text-2xl font-extrabold text-primary-600">
                  {weightDiff.toFixed(1)}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">kg {direction}重</div>
              </div>
              <div className="text-center p-3 rounded-2xl bg-stone-50">
                <div className="text-2xl font-extrabold text-primary-600">{avgPerDay}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">kg/天</div>
              </div>
            </div>

            {/* Weight journey */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-stone-800">{goal.startWeight}</div>
                <div className="text-[11px] text-stone-400">起始</div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-stone-200 via-primary-300 to-stone-200 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="i-lucide-arrow-right text-white text-xs" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary-600">{goal.targetWeight}</div>
                <div className="text-[11px] text-stone-400">目标</div>
              </div>
            </div>

            <p className="text-sm text-stone-600 text-center leading-relaxed">
              {getEncouragement()}
            </p>
          </div>

          {/* Brand footer */}
          <div className="px-6 py-3 border-t border-stone-100 flex items-center justify-center gap-1.5">
            <span className="i-lucide-scale text-primary-500 text-sm" />
            <span className="text-xs font-semibold text-stone-400 tracking-wide">SCALETRACK</span>
          </div>
        </div>

        {/* Action buttons (outside the shareable card) */}
        <div className="mt-4 space-y-2.5">
          <button
            onClick={handleSaveImage}
            disabled={saving}
            className="btn-primary w-full py-3.5 text-[15px] font-semibold flex items-center justify-center gap-2"
          >
            <span className={saving ? 'i-lucide-loader-2 animate-spin' : 'i-lucide-download'} />
            {saving ? '保存中...' : '保存图片分享'}
          </button>
          <div className="flex gap-2.5">
            <button onClick={onSetNew} className="btn-outline flex-1 py-3 text-sm font-medium">
              设定新目标
            </button>
            <button
              onClick={onClose}
              className="btn flex-1 py-3 text-sm font-medium text-[var(--c-text-secondary)] hover:bg-[var(--c-bg-secondary)] rounded-2xl"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
