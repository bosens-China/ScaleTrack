import dayjs from 'dayjs'
import { useCallback, useMemo, useState } from 'react'
import BottomTabBar from './components/BottomTabBar'
import ToastContainer from './components/Toast'
import AddRecordPage from './pages/AddRecordPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SetupPage from './pages/SetupPage'
import TrendsPage from './pages/TrendsPage'
import type { AppTab, Goal, UserProfile, WeightRecord } from './types'
import { calcBMI } from './utils/bmi'
import { getCurrentWeight } from './utils/stats'
import {
  getGoals,
  getProfile,
  getRecords,
  saveGoal,
  saveProfile,
  saveRecord,
  saveRecords,
} from './utils/storage'
import { toast } from './utils/toast'

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(getProfile)
  const [records, setRecords] = useState<WeightRecord[]>(() => getRecords())
  const [goals, setGoals] = useState<Goal[]>(() => getGoals())
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard')
  const today = dayjs().format('YYYY-MM-DD')

  const refreshAll = useCallback(() => {
    setProfile(getProfile())
    setRecords(getRecords())
    setGoals(getGoals())
  }, [])

  const handleSetupComplete = (nextProfile: UserProfile) => {
    saveProfile(nextProfile)
    setProfile(nextProfile)
    setActiveTab('dashboard')
  }

  const handleProfileUpdate = useCallback(
    (patch: Partial<UserProfile>) => {
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
    },
    [profile],
  )

  const handleSaveGoal = useCallback(
    (targetWeight: number) => {
      if (!profile) return

      const activeGoal = goals.find(goal => !goal.isCompleted) ?? null
      const currentWeight = getCurrentWeight(profile, records)
      const goal: Goal = {
        id: activeGoal?.id ?? crypto.randomUUID(),
        targetWeight,
        startWeight: activeGoal?.startWeight ?? currentWeight,
        startDate: activeGoal?.startDate ?? dayjs().format('YYYY-MM-DD'),
        isCompleted: false,
      }

      saveGoal(goal)
      setGoals(getGoals())
      toast.success('目标体重已保存')
    },
    [goals, profile, records],
  )

  const handleSaveRecord = useCallback(
    ({ date, weight, note }: { date: string; weight: number; note?: string }) => {
      if (!profile) return
      const existingRecord = records.find(record => record.date === date)

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

      const activeGoal = goals.find(goal => !goal.isCompleted) ?? null
      if (activeGoal) {
        const reached =
          (activeGoal.startWeight > activeGoal.targetWeight && weight <= activeGoal.targetWeight) ||
          (activeGoal.startWeight < activeGoal.targetWeight && weight >= activeGoal.targetWeight)

        if (reached) {
          saveGoal({ ...activeGoal, isCompleted: true, completedDate: date })
          setGoals(getGoals())
          toast.success('目标已达成，已自动归档到里程碑')
        }
      }

      toast.success(
        existingRecord
          ? `已覆盖今日记录：${weight.toFixed(1)} kg`
          : `体重记录成功：${weight.toFixed(1)} kg`,
      )
      setActiveTab('dashboard')
    },
    [goals, profile, records],
  )

  const activeGoal = useMemo(() => goals.find(goal => !goal.isCompleted) ?? null, [goals])
  const latestRecord = records.at(-1)
  const todayRecord = useMemo(
    () => records.find(record => record.date === today) ?? null,
    [records, today],
  )

  const renderPage = () => {
    if (!profile) {
      return <SetupPage onComplete={handleSetupComplete} />
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            profile={profile}
            records={records}
            goal={activeGoal}
            onNavigate={setActiveTab}
          />
        )
      case 'trends':
        return <TrendsPage records={records} onNavigate={setActiveTab} />
      case 'add':
        return (
          <AddRecordPage
            initialWeight={todayRecord?.weight ?? latestRecord?.weight ?? profile.initialWeight}
            existingRecord={todayRecord}
            onSave={handleSaveRecord}
          />
        )
      case 'profile':
        return (
          <ProfilePage
            profile={profile}
            records={records}
            goal={activeGoal}
            onSaveGoal={handleSaveGoal}
            onProfileUpdate={handleProfileUpdate}
            onReload={refreshAll}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {renderPage()}
      {profile && <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />}
      <ToastContainer />
    </>
  )
}
