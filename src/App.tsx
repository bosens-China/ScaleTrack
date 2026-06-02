import BottomTabBar from '@/components/BottomTabBar'
import GoalAchievementModal from '@/components/GoalAchievementModal'
import ToastContainer from '@/components/Toast'
import { useAppState } from '@/hooks/useAppState'
import AddRecordPage from '@/pages/AddRecordPage'
import DashboardPage from '@/pages/DashboardPage'
import EditUserInfoPage from '@/pages/EditUserInfoPage'
import ProfilePage from '@/pages/ProfilePage'
import SetupPage from '@/pages/SetupPage'
import TrendsPage from '@/pages/TrendsPage'
import type { AppTab } from '@/types'

export default function App() {
  const {
    profile,
    records,
    activeGoal,
    milestones,
    activePage,
    today,
    achievedGoal,
    setActivePage,
    setAchievedGoal,
    handleSetupComplete,
    handleProfileUpdate,
    handleSaveGoal,
    handleSaveRecord,
    handleDeleteRecord,
    refreshAll,
  } = useAppState()

  const latestRecord = records.at(-1)
  const todayRecord = records.find(r => r.date === today) ?? null

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
            goal={activeGoal}
            onNavigate={setActivePage}
            onDeleteRecord={handleDeleteRecord}
          />
        )
      case 'trends':
        return <TrendsPage records={records} onNavigate={setActivePage} />
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
            onNavigate={setActivePage}
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
      default:
        return null
    }
  }

  const activeTab = (activePage === 'edit-user-info' ? null : activePage) as AppTab | null

  return (
    <>
      {renderPage()}
      {profile && activeTab !== null && (
        <BottomTabBar activeTab={activeTab} onChange={setActivePage} />
      )}
      <ToastContainer />
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
    </>
  )
}
