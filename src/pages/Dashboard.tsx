import { useCallback, useState } from 'react'
import BMILegend from '../components/BMILegend'
import BottomSheet from '../components/BottomSheet'
import ConfirmDialog from '../components/ConfirmDialog'
import DataImportExport from '../components/DataImportExport'
import GoalAchievementModal from '../components/GoalAchievementModal'
import GoalTracker from '../components/GoalTracker'
import MilestoneList from '../components/MilestoneList'
import RecordForm from '../components/RecordForm'
import RecordList from '../components/RecordList'
import ThemeToggle from '../components/ThemeToggle'
import WeightChart from '../components/WeightChart'
import type { Goal, UserProfile, WeightRecord } from '../types'
import { BMI_RANGES, calcBMI, getBMICategory, getBMIColor } from '../utils/bmi'
import { getActiveGoal, getMilestones, getRecords, saveGoal, updateProfile } from '../utils/storage'
import { toast } from '../utils/toast'

interface Props {
  profile: UserProfile
  onReset: () => void
}

export default function Dashboard({ profile, onReset }: Props) {
  const [records, setRecords] = useState<WeightRecord[]>(getRecords())
  const [milestones, setMilestones] = useState<Goal[]>(getMilestones())
  const [celebration, setCelebration] = useState<Goal | null>(null)
  const [showHeightDrawer, setShowHeightDrawer] = useState(false)
  const [heightInput, setHeightInput] = useState(String(profile.height))
  const [showResetDialog, setShowResetDialog] = useState(false)

  const refresh = useCallback(() => {
    setRecords(getRecords())
    setMilestones(getMilestones())
  }, [])

  const latestRecord = records.length > 0 ? records[records.length - 1] : null
  const currentWeight = latestRecord?.weight ?? profile.initialWeight
  const currentBMI = latestRecord?.bmi ?? calcBMI(profile.initialWeight, profile.height)
  const bmiCategory = getBMICategory(currentBMI)
  const bmiColor = getBMIColor(currentBMI)
  const bmiRange = BMI_RANGES.find(r => r.category === bmiCategory)

  const handleRecordSaved = useCallback(
    (record: WeightRecord) => {
      refresh()
      toast.success(`体重记录成功: ${record.weight} kg`)
      const goal = getActiveGoal()
      if (!goal) return

      const isReached =
        (goal.startWeight > goal.targetWeight && record.weight <= goal.targetWeight) ||
        (goal.startWeight < goal.targetWeight && record.weight >= goal.targetWeight)

      if (isReached) {
        const completedGoal: Goal = { ...goal, isCompleted: true, completedDate: record.date }
        saveGoal(completedGoal)
        setCelebration(completedGoal)
        refresh()
      }
    },
    [refresh],
  )

  const handleSaveHeight = () => {
    const h = parseFloat(heightInput)
    if (h >= 50 && h <= 250) {
      updateProfile({ height: h })
      toast.success('身高更新成功！')
      setShowHeightDrawer(false)
    } else {
      toast.error('请输入有效的身高（50-250cm）')
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--c-bg)] pb-12">
      {/* Header (高斯模糊背景，完美间距) */}
      <div className="sticky top-0 z-10 bg-[var(--c-bg)]/75 backdrop-blur-xl border-b border-[var(--c-border)]/50">
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/10">
              <span className="i-lucide-scale text-white w-5 h-5" />
            </div>
            <h1 className="font-sans text-base font-extrabold text-[var(--c-text)] tracking-tight">
              ScaleTrack
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <button
              onClick={() => setShowResetDialog(true)}
              className="w-10 h-10 flex items-center justify-center rounded-2xl text-[var(--c-text-secondary)] hover:text-[var(--c-text)] hover:bg-[var(--c-bg-secondary)] active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label="重置设置"
            >
              <span className="i-lucide-rotate-ccw text-base" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5 stagger-children">
        {/* Current Status (精品卡片，间距与高低差精细调优) */}
        <div className="card p-6 shadow-xl shadow-[var(--c-card-shadow)] bg-gradient-to-br from-[var(--c-card)] to-[var(--c-bg-secondary)]/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs text-[var(--c-text-secondary)] font-body font-medium tracking-wide uppercase">
                当前体重
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-sans text-[44px] font-extrabold leading-none text-[var(--c-text)] tracking-tight">
                  {currentWeight}
                </span>
                <span className="text-xs text-[var(--c-text-secondary)] font-bold">kg</span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-[var(--c-text-secondary)] font-body font-medium tracking-wide uppercase">
                BMI 指数
              </div>
              <div
                className="font-sans text-[36px] font-extrabold leading-none"
                style={{ color: bmiColor }}
              >
                {currentBMI}
              </div>
              <div
                className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block"
                style={{ backgroundColor: `${bmiColor}15`, color: bmiColor }}
              >
                {bmiRange?.label}
              </div>
            </div>
          </div>

          {/* Profile info (优化触控区与字距) */}
          <div className="mt-5 pt-4 border-t border-[var(--c-border)]/60 flex items-center justify-between text-xs text-[var(--c-text-secondary)] font-body font-medium">
            <span className="flex items-center gap-1.5">
              <span
                className={
                  profile.gender === 'male'
                    ? 'i-lucide-user text-emerald-500'
                    : 'i-lucide-user-round text-rose-500'
                }
              />
              性别：{profile.gender === 'male' ? '男' : '女'}
            </span>
            <button
              onClick={() => {
                setHeightInput(String(profile.height))
                setShowHeightDrawer(true)
              }}
              className="flex items-center gap-1 hover:text-primary-600 active:scale-98 transition-all cursor-pointer py-1 px-2.5 rounded-lg bg-[var(--c-bg-secondary)] text-[var(--c-text)] border border-[var(--c-border)]/40 font-medium"
            >
              身高：{profile.height} cm
              <span className="i-lucide-chevron-right text-[10px] text-[var(--c-text-secondary)]/50" />
            </button>
          </div>
        </div>

        {/* Record Form */}
        <RecordForm profile={profile} onSaved={handleRecordSaved} lastRecord={latestRecord} />

        {/* Goal */}
        <GoalTracker currentWeight={currentWeight} onGoalSet={refresh} />

        {/* Chart */}
        <WeightChart records={records} />

        {/* BMI Legend */}
        <BMILegend />

        {/* Milestones */}
        <MilestoneList milestones={milestones} />

        {/* Records */}
        <RecordList records={records} onDelete={refresh} />

        {/* Data Management */}
        <DataImportExport />

        {/* Footer */}
        <div className="text-center text-xs text-[var(--c-text-secondary)]/50 pb-6 pt-2 font-body font-medium">
          ScaleTrack · 本地沙盒，隐私绝对安全
        </div>
      </div>

      {/* Goal Achievement Modal */}
      {celebration && (
        <GoalAchievementModal
          goal={celebration}
          onClose={() => setCelebration(null)}
          onSetNew={() => setCelebration(null)}
        />
      )}

      {/* Height Drawer (优化为优雅的底部抽屉 BottomSheet) */}
      <BottomSheet
        isOpen={showHeightDrawer}
        onClose={() => setShowHeightDrawer(false)}
        title="修改身高设置"
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs text-[var(--c-text-secondary)] font-medium">身高 (cm)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="请输入您的身高"
              value={heightInput}
              onChange={e => setHeightInput(e.target.value)}
              className="input text-base"
              autoFocus
            />
          </div>
          <button
            onClick={handleSaveHeight}
            className="btn-primary w-full py-3.5 text-sm font-semibold"
          >
            确认保存身高
          </button>
        </div>
      </BottomSheet>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={onReset}
        title="重置配置确认"
        message="您确定要重置身高与性别吗？这仅会重置基础个人档案，但绝对不会删除您已记录的体重历史数据。"
        confirmText="确认重置"
        cancelText="取消"
        isDanger={true}
      />
    </div>
  )
}
