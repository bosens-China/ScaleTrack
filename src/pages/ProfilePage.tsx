import { useRef, useState } from 'react'

import type { Goal, UserProfile, WeightRecord } from '../types'
import { BMI_RANGES, getBMICategory } from '../utils/bmi'
import { getCurrentBMI, getCurrentWeight, getGoalProgress } from '../utils/stats'
import { exportData, importData } from '../utils/storage'
import { toast } from '../utils/toast'
import { validateHeight } from '../utils/validation'

interface Props {
  profile: UserProfile
  records: WeightRecord[]
  goal: Goal | null
  onSaveGoal: (targetWeight: number) => void
  onProfileUpdate: (patch: Partial<UserProfile>) => void
  onReload: () => void
}

export default function ProfilePage({
  profile,
  records,
  goal,
  onSaveGoal,
  onProfileUpdate,
  onReload,
}: Props) {
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(goal?.targetWeight.toFixed(1) ?? '')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [heightInput, setHeightInput] = useState(String(profile.height))
  const [genderInput, setGenderInput] = useState(profile.gender)
  const fileRef = useRef<HTMLInputElement>(null)

  const currentWeight = getCurrentWeight(profile, records)
  const currentBMI = getCurrentBMI(profile, records)
  const bmiCategory = getBMICategory(currentBMI)
  const bmiRange = BMI_RANGES.find(range => range.category === bmiCategory)
  const progress = getGoalProgress(goal, currentWeight)
  const bmiPercent = Math.min(100, Math.max(0, (currentBMI / 35) * 100))

  const handleToggleProfileEdit = () => {
    if (isEditingProfile) {
      setIsEditingProfile(false)
      return
    }

    setHeightInput(String(profile.height))
    setGenderInput(profile.gender)
    setIsEditingProfile(true)
  }

  const handleExport = () => {
    try {
      const data = exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `scaletrack-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('数据导出成功')
    } catch {
      toast.error('数据导出失败')
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        importData(JSON.parse(reader.result as string))
        toast.success('数据导入成功')
        onReload()
      } catch {
        toast.error('导入失败，JSON 文件格式不正确')
      }
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="app-page bg-[var(--carbon-bg)]">
      <main className="app-main flex flex-col gap-4 px-4 pb-8 pt-4">
        <section className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] text-[var(--carbon-primary)]">
              <span className="i-lucide-user-round h-8 w-8" />
            </div>
            <button
              onClick={handleToggleProfileEdit}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--carbon-surface)] bg-[var(--carbon-primary)] text-white shadow-sm"
              aria-label="编辑基础信息"
            >
              <span className="i-lucide-pencil h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-medium text-[var(--carbon-text)]">本地用户</h2>
            <p className="text-sm text-[var(--carbon-text-secondary)]">
              稳步记录，持续接近你的健康目标
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4">
          <div className="flex items-center justify-between border-b border-[var(--carbon-border)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
              目标设置
            </h3>
            <button
              onClick={() => {
                setGoalInput(goal?.targetWeight.toFixed(1) ?? '')
                setIsEditingGoal(value => !value)
              }}
              className="text-sm text-[var(--carbon-primary)]"
            >
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
              <span>距离目标</span>
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
          </div>

          {isEditingGoal && (
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
                  onFocus={e =>
                    setTimeout(
                      () => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                      300,
                    )
                  }
                  className="h-12 flex-1 border-b border-[var(--carbon-outline)] bg-[var(--carbon-surface-subtle)] px-4 text-sm outline-none focus:border-[var(--carbon-primary)]"
                  placeholder="例如：65.0"
                />
                <button
                  onClick={() => {
                    const parsed = Number.parseFloat(goalInput)
                    if (Number.isNaN(parsed) || parsed < 20 || parsed > 300) {
                      toast.error('请输入有效的目标体重')
                      return
                    }
                    onSaveGoal(parsed)
                    setIsEditingGoal(false)
                  }}
                  className="bg-[var(--carbon-primary)] px-5 text-sm font-medium text-white hover:bg-[var(--carbon-primary-hover)]"
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4">
          <div className="flex items-center justify-between border-b border-[var(--carbon-border)] pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
              BMI 信息
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-[var(--carbon-primary)]">
                {currentBMI.toFixed(1)}
              </span>
              <span className="bg-[var(--carbon-primary-soft)] px-2 py-0.5 text-xs text-[var(--carbon-primary)]">
                {bmiRange?.label ?? '正常'}
              </span>
            </div>
          </div>

          <div className="relative pb-6 pt-4">
            <div className="flex h-2 w-full">
              <div className="h-full w-[18.5%] bg-[var(--carbon-primary-soft)]" />
              <div className="h-full w-[31.5%] bg-[var(--carbon-primary)]" />
              <div className="h-full w-[25%] bg-[#f1c21b]" />
              <div className="h-full w-[25%] bg-[#fa4d56]" />
            </div>
            <div
              className="absolute top-4 -translate-x-1/2 transition-all duration-300"
              style={{ left: `${bmiPercent}%` }}
            >
              <div className="h-3 w-px bg-[var(--carbon-text)]" />
            </div>
            <div
              className="absolute top-8 w-[18.5%] text-center text-[10px] text-[var(--carbon-outline)]"
              style={{ left: '0%' }}
            >
              &lt; 18.5
            </div>
            <div
              className="absolute top-8 w-[31.5%] text-center text-[10px] text-[var(--carbon-outline)]"
              style={{ left: '18.5%' }}
            >
              18.5 - 24
            </div>
            <div
              className="absolute top-8 w-[25%] text-center text-[10px] text-[var(--carbon-outline)]"
              style={{ left: '50%' }}
            >
              24 - 28
            </div>
            <div
              className="absolute top-8 w-[25%] text-center text-[10px] text-[var(--carbon-outline)]"
              style={{ left: '75%' }}
            >
              28+
            </div>
          </div>

          <div className="border-l-4 border-[var(--carbon-primary)] bg-[var(--carbon-surface-subtle)] p-3">
            <div className="flex items-start gap-3">
              <span className="i-lucide-info h-4 w-4 shrink-0 text-[var(--carbon-primary)]" />
              <p className="text-sm leading-6 text-[var(--carbon-text)]">
                您的 BMI 处于 <span className="font-semibold">{bmiRange?.label ?? '正常'}</span>{' '}
                范围。
                {bmiRange?.description ?? '保持健康体重可以降低健康风险。'}
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
            基础信息
          </h3>
          <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
            {isEditingProfile ? (
              <div className="flex flex-col gap-4 p-4">
                <div className="grid grid-cols-2 gap-3">
                  {(['male', 'female'] as const).map(value => (
                    <button
                      key={value}
                      onClick={() => setGenderInput(value)}
                      className={`h-11 border text-sm ${
                        genderInput === value
                          ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)]'
                          : 'border-[var(--carbon-border)] text-[var(--carbon-text-secondary)]'
                      }`}
                    >
                      {value === 'male' ? '男' : '女'}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={heightInput}
                  onChange={event => setHeightInput(event.target.value)}
                  onFocus={e =>
                    setTimeout(
                      () => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                      300,
                    )
                  }
                  className="h-12 w-full border-b border-[var(--carbon-outline)] bg-[var(--carbon-surface-subtle)] px-4 text-sm outline-none focus:border-[var(--carbon-primary)]"
                  placeholder="身高（cm）"
                />
                <button
                  onClick={() => {
                    const parsed = Number.parseFloat(heightInput)
                    if (!validateHeight(parsed)) {
                      toast.error('请输入有效的身高')
                      return
                    }
                    onProfileUpdate({ gender: genderInput, height: parsed })
                    setIsEditingProfile(false)
                  }}
                  className="h-12 w-full bg-[var(--carbon-primary)] text-sm font-medium text-white hover:bg-[var(--carbon-primary-hover)]"
                >
                  保存基础信息
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[var(--carbon-border)] p-4">
                  <div className="flex items-center gap-4">
                    <span className="i-lucide-stretch-horizontal h-5 w-5 text-[var(--carbon-text-secondary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--carbon-text)]">身高</p>
                      <p className="text-xs text-[var(--carbon-text-secondary)]">
                        {profile.height} cm
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleProfileEdit}
                    className="text-sm font-medium text-[var(--carbon-primary)]"
                  >
                    更改
                  </button>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--carbon-border)] p-4">
                  <div className="flex items-center gap-4">
                    <span className="i-lucide-users h-5 w-5 text-[var(--carbon-text-secondary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--carbon-text)]">性别</p>
                      <p className="text-xs text-[var(--carbon-text-secondary)]">
                        {profile.gender === 'male' ? '男' : '女'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <span className="i-lucide-scale h-5 w-5 text-[var(--carbon-text-secondary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--carbon-text)]">初始体重</p>
                      <p className="text-xs text-[var(--carbon-text-secondary)]">
                        {profile.initialWeight.toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
            本地数据
          </h3>
          <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
            <button
              onClick={handleExport}
              className="flex w-full items-center justify-between border-b border-[var(--carbon-border)] p-4 text-left transition-colors hover:bg-[var(--carbon-surface-subtle)]"
            >
              <div className="flex items-center gap-4">
                <span className="i-lucide-download h-5 w-5 text-[var(--carbon-text-secondary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--carbon-text)]">导出数据</p>
                  <p className="text-xs text-[var(--carbon-text-secondary)]">
                    导出基础资料、体重记录和目标数据
                  </p>
                </div>
              </div>
              <span className="i-lucide-chevron-right h-5 w-5 text-[var(--carbon-outline)]" />
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--carbon-surface-subtle)]"
            >
              <div className="flex items-center gap-4">
                <span className="i-lucide-upload h-5 w-5 text-[var(--carbon-text-secondary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--carbon-text)]">导入数据</p>
                  <p className="text-xs text-[var(--carbon-text-secondary)]">
                    从 JSON 文件恢复本地记录
                  </p>
                </div>
              </div>
              <span className="i-lucide-chevron-right h-5 w-5 text-[var(--carbon-outline)]" />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </section>
      </main>
    </div>
  )
}
