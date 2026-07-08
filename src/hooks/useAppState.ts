import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import type { AppPage, Goal, UserProfile, WeightRecord } from '@/types'
import { calcBMI } from '@/utils/bmi'
import { reconcileLatestGoalState, shouldCelebrateGoalCompletion } from '@/utils/goal-state'
import { getCurrentWeight } from '@/utils/stats'
import {
  deleteGoal,
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
  handleSaveGoal: (targetWeight: number, targetDate?: string) => void
  handleAbandonGoal: () => void
  handleSaveRecord: (payload: { date: string; weight: number; note?: string }) => void
  handleUpdateRecord: (id: string, patch: { weight?: number; note?: string }) => void
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
    const nextRecords = getRecords()
    setRecords(nextRecords)

    const reconcileResult = reconcileLatestGoalState(goals, nextRecords)
    if (reconcileResult.changed && reconcileResult.nextGoal) {
      saveGoal(reconcileResult.nextGoal)
      setGoals(getGoals())
      if (!reconcileResult.nextGoal.isCompleted) {
        setAchievedGoal(current => (current?.id === reconcileResult.nextGoal?.id ? null : current))
      }
    }
    toast.success('记录已删除')
  }

  const handleSetupComplete = (nextProfile: UserProfile) => {
    const now = new Date().toISOString()
    const initialRecord: WeightRecord = {
      id: crypto.randomUUID(),
      date: dayjs().format('YYYY-MM-DD'),
      weight: nextProfile.initialWeight,
      bmi: calcBMI(nextProfile.initialWeight, nextProfile.height),
      createdAt: now,
      updatedAt: now,
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

  const handleSaveGoal = (targetWeight: number, targetDate?: string) => {
    if (!profile) return
    const existing = goals.find(g => !g.isCompleted) ?? null
    const currentWeight = getCurrentWeight(profile, records)
    const goal: Goal = {
      id: existing?.id ?? crypto.randomUUID(),
      targetWeight,
      startWeight: existing?.startWeight ?? currentWeight,
      startDate: existing?.startDate ?? dayjs().format('YYYY-MM-DD'),
      targetDate,
      isCompleted: false,
    }
    saveGoal(goal)
    setGoals(getGoals())
    toast.success('目标体重已保存')
  }

  const handleAbandonGoal = () => {
    const existing = goals.find(g => !g.isCompleted)
    if (!existing) return
    deleteGoal(existing.id)
    setGoals(getGoals())
    setAchievedGoal(current => (current?.id === existing.id ? null : current))
    toast.success('已放弃当前目标')
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
    const now = new Date().toISOString()
    const record: WeightRecord = {
      id: existingRecord?.id ?? crypto.randomUUID(),
      date,
      weight,
      bmi: calcBMI(weight, profile.height),
      note,
      createdAt: existingRecord?.createdAt ?? now,
      updatedAt: now,
    }
    saveRecord(record)
    const nextRecords = getRecords()
    setRecords(nextRecords)

    const reconcileResult = reconcileLatestGoalState(goals, nextRecords)
    if (reconcileResult.changed && reconcileResult.nextGoal) {
      saveGoal(reconcileResult.nextGoal)
      setGoals(getGoals())

      if (
        shouldCelebrateGoalCompletion({
          previousGoal: reconcileResult.previousGoal,
          nextGoal: reconcileResult.nextGoal,
          recordDate: date,
          today,
        })
      ) {
        setAchievedGoal(reconcileResult.nextGoal)
      } else if (!reconcileResult.nextGoal.isCompleted) {
        setAchievedGoal(current => (current?.id === reconcileResult.nextGoal?.id ? null : current))
      }
    }

    toast.success(
      existingRecord
        ? `已覆盖今日记录：${weight.toFixed(1)} kg`
        : `体重记录成功：${weight.toFixed(1)} kg`,
    )
    setActivePage('dashboard')
  }

  /** 内联编辑已有记录的体重/备注，不离开当前页面 */
  const handleUpdateRecord = (id: string, patch: { weight?: number; note?: string }) => {
    if (!profile) return
    const target = records.find(r => r.id === id)
    if (!target) return

    const nextWeight = patch.weight ?? target.weight
    const updated: WeightRecord = {
      ...target,
      weight: nextWeight,
      bmi: calcBMI(nextWeight, profile.height),
      note: patch.note !== undefined ? patch.note || undefined : target.note,
      updatedAt: new Date().toISOString(),
    }
    saveRecord(updated)
    const nextRecords = getRecords()
    setRecords(nextRecords)

    const reconcileResult = reconcileLatestGoalState(goals, nextRecords)
    if (reconcileResult.changed && reconcileResult.nextGoal) {
      saveGoal(reconcileResult.nextGoal)
      setGoals(getGoals())
      if (!reconcileResult.nextGoal.isCompleted) {
        setAchievedGoal(current => (current?.id === reconcileResult.nextGoal?.id ? null : current))
      }
    }
    toast.success('记录已更新')
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
    handleAbandonGoal,
    handleSaveRecord,
    handleUpdateRecord,
    handleDeleteRecord,
    refreshAll,
  }
}
