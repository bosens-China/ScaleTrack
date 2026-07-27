import { useState } from 'react'

import ActivityRecordForm from '@/components/ActivityRecordForm'
import type { ActivityType, UserProfile, WeightRecord } from '@/types'

import AddRecordPage from './AddRecordPage'

type AddMode = 'hub' | 'weight' | 'activity'

interface Props {
  profile: UserProfile
  records: WeightRecord[]
  activityTypes: ActivityType[]
  onSaveWeight: (payload: { date: string; weight: number; note?: string }) => void
  onSaveActivity: (payload: {
    activityTypeId: string
    date: string
    durationMinutes: number
    note?: string
  }) => void
  onAddActivityType: (name: string) => ActivityType | null
  onDeleteActivityType: (id: string) => void
}

export default function AddPage({
  profile,
  records,
  activityTypes,
  onSaveWeight,
  onSaveActivity,
  onAddActivityType,
  onDeleteActivityType,
}: Props) {
  const [mode, setMode] = useState<AddMode>('hub')

  if (mode === 'weight') {
    return (
      <AddRecordPage
        profile={profile}
        records={records}
        onSave={onSaveWeight}
        onBack={() => setMode('hub')}
      />
    )
  }

  if (mode === 'activity') {
    return (
      <div className="app-page bg-[var(--carbon-bg)]">
        <main className="app-main flex flex-col gap-6 px-4 pb-8 pt-4">
          <header className="flex items-center gap-3">
            <button
              onClick={() => setMode('hub')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--carbon-border)] bg-[var(--carbon-surface)] text-[var(--carbon-text)]"
              aria-label="返回添加记录"
            >
              <span className="i-lucide-arrow-left h-5 w-5" />
            </button>
            <div>
              <p className="sport-kicker">Activity log</p>
              <h1 className="text-2xl font-black tracking-tight text-[var(--carbon-text)]">
                运动打卡
              </h1>
            </div>
          </header>

          <ActivityRecordForm
            activityTypes={activityTypes}
            onSave={onSaveActivity}
            onAddType={onAddActivityType}
            onDeleteType={onDeleteActivityType}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="app-page sport-grid-bg bg-[var(--carbon-bg)]">
      <main className="app-main flex min-h-[calc(100dvh-var(--app-tabbar-height))] flex-col px-4 pb-8 pt-5">
        <header>
          <p className="sport-kicker">New log / 选择记录</p>
          <h1 className="mt-2 max-w-[300px] text-[36px] font-black leading-[1.04] tracking-[-0.04em] text-[var(--carbon-text)]">
            今天，身体
            <br />
            发生了什么？
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--carbon-text-secondary)]">
            记录一个数字，或一次让身体动起来的时刻。
          </p>
        </header>

        <div className="mt-8 grid flex-1 grid-rows-2 gap-4">
          <button
            onClick={() => setMode('weight')}
            className="group relative min-h-[190px] overflow-hidden border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-5 text-left transition-colors hover:border-[var(--carbon-primary)]"
          >
            <span className="absolute -right-5 -top-8 text-[140px] font-black leading-none text-[var(--carbon-surface-strong)] transition-transform duration-300 group-hover:-translate-x-2">
              01
            </span>
            <div className="relative flex h-full flex-col justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)]">
                <span className="i-lucide-scale h-6 w-6" />
              </span>
              <div>
                <p className="sport-kicker">Weight / 0.1 kg</p>
                <div className="mt-1 flex items-end justify-between">
                  <h2 className="text-2xl font-black text-[var(--carbon-text)]">记录体重</h2>
                  <span className="i-lucide-arrow-up-right h-6 w-6 text-[var(--carbon-text-secondary)]" />
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('activity')}
            className="group relative min-h-[190px] overflow-hidden border border-[var(--sport-accent)] bg-[var(--sport-hero-bg)] p-5 text-left text-[var(--sport-hero-text)]"
          >
            <span className="absolute -right-5 -top-8 text-[140px] font-black leading-none text-[var(--sport-hero-number)] transition-transform duration-300 group-hover:-translate-x-2">
              02
            </span>
            <div className="relative flex h-full flex-col justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sport-accent)] text-[var(--sport-accent-text)]">
                <span className="i-lucide-dumbbell h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-65">
                  Activity / Move
                </p>
                <div className="mt-1 flex items-end justify-between">
                  <h2 className="text-2xl font-black">运动打卡</h2>
                  <span className="i-lucide-arrow-up-right h-6 w-6 opacity-70" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}
