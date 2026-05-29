import { useState } from 'react'
import ToastContainer from './components/Toast'
import Dashboard from './pages/Dashboard'
import SetupPage from './pages/SetupPage'
import type { UserProfile } from './types'
import { getProfile, saveProfile } from './utils/storage'

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(getProfile)

  const handleSetupComplete = (p: UserProfile) => {
    saveProfile(p)
    setProfile(p)
  }

  const handleReset = () => {
    // 确认过程已由 Dashboard 的高阶 ConfirmDialog 组件接管并提供视觉保护，这里直接执行状态重置
    setProfile(null)
  }

  return (
    <>
      {profile ? (
        <Dashboard profile={profile} onReset={handleReset} />
      ) : (
        <SetupPage onComplete={handleSetupComplete} />
      )}
      {/* 全局 Toast 通知中心 */}
      <ToastContainer />
    </>
  )
}
