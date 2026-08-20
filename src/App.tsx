import { useEffect, useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import BottomTabBar from '@/components/BottomTabBar'
import GoalAchievementModal from '@/components/GoalAchievementModal'
import PwaUpdateBanner from '@/components/PwaUpdateBanner'
import ToastContainer from '@/components/Toast'
import { useAppState } from '@/hooks/useAppState'
import { useTheme } from '@/hooks/useTheme'
import { WeightUnitContext } from '@/hooks/weight-unit-context'
import ActivityPage from '@/pages/ActivityPage'
import AddPage from '@/pages/AddPage'
import DashboardPage from '@/pages/DashboardPage'
import EditUserInfoPage from '@/pages/EditUserInfoPage'
import MilestoneDetailPage from '@/pages/MilestoneDetailPage'
import ProfilePage from '@/pages/ProfilePage'
import SetupPage from '@/pages/SetupPage'
import TrendsPage from '@/pages/TrendsPage'
import type { AppTab } from '@/types'
import { hydrateStore } from '@/utils/storage'

export default function App() {
  // 主题在水合前即应用，避免启动画面闪烁
  useTheme()
  const [ready, setReady] = useState(false)
  const { t } = useI18n()

  // 启动时先把数据从 IndexedDB 水合到内存缓存（含旧 localStorage 迁移）
  useEffect(() => {
    let active = true
    hydrateStore()
      .catch(err => console.error('数据初始化失败', err))
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  if (!ready) {
    return (
      <div className="app-page flex items-center justify-center bg-[var(--carbon-bg)]">
        <div className="flex flex-col items-center gap-3 text-[var(--carbon-text-secondary)]">
          <span className="i-lucide-loader-2 h-7 w-7 animate-spin text-[var(--carbon-primary)]" />
          <span className="text-sm">{t('正在加载本地数据…')}</span>
        </div>
      </div>
    )
  }

  return <AppInner />
}

function AppInner() {
  const {
    profile,
    records,
    activityRecords,
    activityTypes,
    activeGoal,
    milestones,
    activePage,
    activeMilestoneId,
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
    handleSaveActivityRecord,
    handleDeleteActivityRecord,
    handleAddActivityType,
    handleDeleteActivityType,
    refreshAll,
  } = useAppState()

  // 底部 Tab 与保存后跳页都应从页面顶部开始，避免长页面继承上一页滚动位置
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [activePage])

  // 当前体重单位来自用户资料（缺省 kg），切换时持久化到资料
  const weightUnit = profile?.weightUnit ?? 'kg'
  const weightUnitValue = {
    unit: weightUnit,
    setUnit: (unit: typeof weightUnit) => handleProfileUpdate({ weightUnit: unit }),
  }

  const renderPage = () => {
    if (!profile) {
      return <SetupPage onComplete={handleSetupComplete} />
    }

    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            profile={profile}
            records={records}
            activityRecords={activityRecords}
            goal={activeGoal}
            onNavigate={setActivePage}
            onDeleteRecord={handleDeleteRecord}
          />
        )
      case 'trends':
        return (
          <TrendsPage
            records={records}
            goal={activeGoal}
            onNavigate={setActivePage}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )
      case 'add':
        return (
          <AddPage
            profile={profile}
            records={records}
            activityRecords={activityRecords}
            activityTypes={activityTypes}
            onSaveWeight={handleSaveRecord}
            onSaveActivity={handleSaveActivityRecord}
            onAddActivityType={handleAddActivityType}
            onDeleteActivityType={handleDeleteActivityType}
          />
        )
      case 'activity':
        return (
          <ActivityPage
            activityRecords={activityRecords}
            activityTypes={activityTypes}
            onNavigate={setActivePage}
            onSaveRecord={handleSaveActivityRecord}
            onDeleteRecord={handleDeleteActivityRecord}
            onAddType={handleAddActivityType}
            onDeleteType={handleDeleteActivityType}
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
            onAbandonGoal={handleAbandonGoal}
            onProfileUpdate={handleProfileUpdate}
            onReload={refreshAll}
            onNavigate={setActivePage}
            onSelectMilestone={id => {
              setActiveMilestoneId(id)
              setActivePage('milestone-detail')
            }}
          />
        )
      case 'edit-user-info':
        return (
          <EditUserInfoPage
            profile={profile}
            onSave={handleProfileUpdate}
            onCancel={() => setActivePage('profile')}
          />
        )
      case 'milestone-detail':
        return (
          <MilestoneDetailPage
            milestoneId={activeMilestoneId}
            milestones={milestones}
            records={records}
            onBack={() => {
              setActiveMilestoneId(null)
              setActivePage('profile')
            }}
          />
        )
      default:
        return null
    }
  }

  const activeTab = (
    activePage === 'edit-user-info' || activePage === 'milestone-detail' ? null : activePage
  ) as AppTab | null

  return (
    <WeightUnitContext.Provider value={weightUnitValue}>
      {renderPage()}
      {profile && activeTab !== null && (
        <BottomTabBar activeTab={activeTab} onChange={setActivePage} />
      )}
      <ToastContainer />
      <PwaUpdateBanner />
      {achievedGoal && (
        <GoalAchievementModal
          goal={achievedGoal}
          onClose={() => setAchievedGoal(null)}
          onSetNew={() => {
            setAchievedGoal(null)
            setActivePage('profile')
          }}
        />
      )}
    </WeightUnitContext.Provider>
  )
}
