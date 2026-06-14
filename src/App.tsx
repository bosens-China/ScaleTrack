import BottomTabBar from '@/components/BottomTabBar'
import GoalAchievementModal from '@/components/GoalAchievementModal'
import PwaUpdateBanner from '@/components/PwaUpdateBanner'
import ToastContainer from '@/components/Toast'
import { useAppState } from '@/hooks/useAppState'
import { useTheme } from '@/hooks/useTheme'
import AddRecordPage from '@/pages/AddRecordPage'
import DashboardPage from '@/pages/DashboardPage'
import EditUserInfoPage from '@/pages/EditUserInfoPage'
import MilestoneDetailPage from '@/pages/MilestoneDetailPage'
import ProfilePage from '@/pages/ProfilePage'
import SetupPage from '@/pages/SetupPage'
import TrendsPage from '@/pages/TrendsPage'
import type { AppTab } from '@/types'

export default function App() {
  useTheme()
  const {
    profile,
    records,
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
    handleSaveRecord,
    handleDeleteRecord,
    refreshAll,
  } = useAppState()

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
        return (
          <TrendsPage
            records={records}
            goal={activeGoal}
            onNavigate={setActivePage}
            onDeleteRecord={handleDeleteRecord}
          />
        )
      case 'add':
        return <AddRecordPage profile={profile} records={records} onSave={handleSaveRecord} />
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
    <>
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
    </>
  )
}
