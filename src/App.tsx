import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import BottomTabBar from './components/BottomTabBar'
import GoalAchievementModal from './components/GoalAchievementModal'
import ToastContainer from './components/Toast'
import AddRecordPage from './pages/AddRecordPage'
import DashboardPage from './pages/DashboardPage'
import EditUserInfoPage from './pages/EditUserInfoPage'
import ProfilePage from './pages/ProfilePage'
import SetupPage from './pages/SetupPage'
import TrendsPage from './pages/TrendsPage'
import type { AppTab, Goal, UserProfile, WeightRecord } from './types'
import { calcBMI } from './utils/bmi'
import { getCurrentWeight } from './utils/stats'
import {
  deleteRecord,
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
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const today = dayjs().format('YYYY-MM-DD')
    const hasTodayRecord = getRecords().some(r => r.date === today)
    return hasTodayRecord ? 'dashboard' : 'add'
  })
  const [achievedGoal, setAchievedGoal] = useState<Goal | null>(null)

  // 跨午夜日期修复：可见性变化时重新计算当天日期
  const [today, setToday] = useState(() => dayjs().format('YYYY-MM-DD'))

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setToday(dayjs().format('YYYY-MM-DD'))
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const refreshAll = useCallback(() => {
    setProfile(getProfile())
    setRecords(getRecords())
    setGoals(getGoals())
  }, [])

  /** 删除单条体重记录 */
  const handleDeleteRecord = useCallback((id: string) => {
    deleteRecord(id)
    setRecords(getRecords())
    toast.success('记录已删除')
  }, [])

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
        // 每次设置/修改目标时，都以当前体重为起点，确保进度从现在算起
        startWeight: currentWeight,
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
          const completedGoal = { ...activeGoal, isCompleted: true, completedDate: date }
          saveGoal(completedGoal)
          setGoals(getGoals())
          setAchievedGoal(completedGoal)
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
  /** 已完成的目标列表（里程碑） */
  const milestones = useMemo(() => goals.filter(g => g.isCompleted), [goals])
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
            onDeleteRecord={handleDeleteRecord}
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
            milestones={milestones}
            onSaveGoal={handleSaveGoal}
            onProfileUpdate={handleProfileUpdate}
            onReload={refreshAll}
            onNavigate={setActiveTab}
          />
        )
      case 'edit-user-info':
        return (
          <EditUserInfoPage
            profile={profile}
            onSave={handleProfileUpdate}
            onCancel={() => setActiveTab('profile')}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {renderPage()}
      {profile && activeTab !== 'edit-user-info' && (
        <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />
      )}
      <ToastContainer />
      {achievedGoal && (
        <GoalAchievementModal
          goal={achievedGoal}
          onClose={() => setAchievedGoal(null)}
          onSetNew={() => {
            setAchievedGoal(null)
            setActiveTab('profile')
          }}
        />
      )}
    </>
  )
}
