import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import type { AppPage, Goal, UserProfile, WeightRecord } from '@/types'
import { calcBMI } from '@/utils/bmi'
import { getCurrentWeight } from '@/utils/stats'
import {
  deleteRecord,
  getGoals,
  getProfile,
  getRecords,
  saveGoal,
  saveProfile,
  saveRecord,
  saveRecords,
} from '@/utils/storage'
import { toast } from '@/utils/toast'

export interface AppState {
  profile: UserProfile | null
  records: WeightRecord[]
  activeGoal: Goal | null
  milestones: Goal[]
  activePage: AppPage
  activeMilestoneId: string | null
  today: string
  achievedGoal: Goal | null
  setActivePage: (page: AppPage) => void
  setActiveMilestoneId: (id: string | null) => void
  setAchievedGoal: (goal: Goal | null) => void
  handleSetupComplete: (profile: UserProfile) => void
  handleProfileUpdate: (patch: Partial<UserProfile>) => void
  handleSaveGoal: (targetWeight: number) => void
  handleSaveRecord: (payload: { date: string; weight: number; note?: string }) => void
  handleDeleteRecord: (id: string) => void
  refreshAll: () => void
}

export function useAppState(): AppState {
  const [profile, setProfile] = useState<UserProfile | null>(getProfile)
  const [records, setRecords] = useState<WeightRecord[]>(() => getRecords())
  const [goals, setGoals] = useState<Goal[]>(() => getGoals())
  const [activePage, setActivePage] = useState<AppPage>(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return getRecords().some(r => r.date === today) ? 'dashboard' : 'add'
  })
  const [achievedGoal, setAchievedGoal] = useState<Goal | null>(null)
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null)
  const [today, setToday] = useState(() => dayjs().format('YYYY-MM-DD'))

  // 跨午夜日期修复：页面重新可见时刷新当天日期
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setToday(dayjs().format('YYYY-MM-DD'))
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const refreshAll = () => {
    setProfile(getProfile())
    setRecords(getRecords())
    setGoals(getGoals())
  }

  const handleDeleteRecord = (id: string) => {
    deleteRecord(id)
    setRecords(getRecords())
    toast.success('记录已删除')
  }

  const handleSetupComplete = (nextProfile: UserProfile) => {
    const initialRecord: WeightRecord = {
      id: crypto.randomUUID(),
      date: dayjs().format('YYYY-MM-DD'),
      weight: nextProfile.initialWeight,
      bmi: calcBMI(nextProfile.initialWeight, nextProfile.height),
      createdAt: new Date().toISOString(),
    }
    saveProfile(nextProfile)
    saveRecord(initialRecord)
    setProfile(nextProfile)
    setRecords(getRecords())
    setActivePage('dashboard')
  }

  const handleProfileUpdate = (patch: Partial<UserProfile>) => {
    if (!profile) return
    const nextProfile = { ...profile, ...patch }
    saveProfile(nextProfile)
    setProfile(nextProfile)
    if (patch.height !== undefined && patch.height !== profile.height) {
      const nextRecords = getRecords().map(record => ({
        ...record,
        bmi: calcBMI(record.weight, nextProfile.height),
      }))
      saveRecords(nextRecords)
      setRecords(nextRecords)
    }
    toast.success('基础信息已更新')
  }

  const handleSaveGoal = (targetWeight: number) => {
    if (!profile) return
    const existing = goals.find(g => !g.isCompleted) ?? null
    const currentWeight = getCurrentWeight(profile, records)
    const goal: Goal = {
      id: existing?.id ?? crypto.randomUUID(),
      targetWeight,
      startWeight: existing?.startWeight ?? currentWeight,
      startDate: existing?.startDate ?? dayjs().format('YYYY-MM-DD'),
      isCompleted: false,
    }
    saveGoal(goal)
    setGoals(getGoals())
    toast.success('目标体重已保存')
  }

  const handleSaveRecord = ({
    date,
    weight,
    note,
  }: {
    date: string
    weight: number
    note?: string
  }) => {
    if (!profile) return
    const existingRecord = records.find(r => r.date === date)
    const record: WeightRecord = {
      id: existingRecord?.id ?? crypto.randomUUID(),
      date,
      weight,
      bmi: calcBMI(weight, profile.height),
      note,
      createdAt: new Date().toISOString(),
    }
    saveRecord(record)
    const nextRecords = getRecords()
    setRecords(nextRecords)

    const active = goals.find(g => !g.isCompleted) ?? null
    if (active) {
      const reached =
        (active.startWeight > active.targetWeight && weight <= active.targetWeight) ||
        (active.startWeight < active.targetWeight && weight >= active.targetWeight)

      if (reached) {
        const completed = { ...active, isCompleted: true, completedDate: date }
        saveGoal(completed)
        setGoals(getGoals())

        // 只有当这条达标记录是最新记录时，才弹出庆祝；若是补填历史记录，则静默转化为里程碑
        const isLatestRecord = nextRecords[nextRecords.length - 1]?.id === record.id
        if (isLatestRecord) {
          setAchievedGoal(completed)
        }
      }
    }

    toast.success(
      existingRecord
        ? `已覆盖今日记录：${weight.toFixed(1)} kg`
        : `体重记录成功：${weight.toFixed(1)} kg`,
    )
    setActivePage('dashboard')
  }

  const activeGoal = goals.find(g => !g.isCompleted) ?? null
  const milestones = goals.filter(g => g.isCompleted)

  return {
    profile,
    records,
    activeGoal,
    milestones,
    activePage,
    activeMilestoneId,
    today,
    achievedGoal,
    setActivePage,
    setActiveMilestoneId,
    setAchievedGoal,
    handleSetupComplete,
    handleProfileUpdate,
    handleSaveGoal,
    handleSaveRecord,
    handleDeleteRecord,
    refreshAll,
  }
}
