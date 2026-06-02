import { useState } from 'react'

import ProfileBasicsSection from '../components/profile/ProfileBasicsSection'
import ProfileBMISection from '../components/profile/ProfileBMISection'
import ProfileDataSection from '../components/profile/ProfileDataSection'
import ProfileGoalSection from '../components/profile/ProfileGoalSection'
import ProfileMilestonesSection from '../components/profile/ProfileMilestonesSection'

import type { Goal, UserProfile, WeightRecord } from '../types'
import { BMI_RANGES, getBMICategory } from '../utils/bmi'
import { getCurrentBMI, getCurrentWeight, getGoalProgress, getSmoothedWeight } from '../utils/stats'

interface Props {
  profile: UserProfile
  records: WeightRecord[]
  goal: Goal | null
  milestones: Goal[]
  onSaveGoal: (targetWeight: number) => void
  onProfileUpdate: (patch: Partial<UserProfile>) => void
  onReload: () => void
  onNavigate: (tab: import('../types').AppTab) => void
}

export default function ProfilePage({
  profile,
  records,
  goal,
  milestones,
  onSaveGoal,
  onProfileUpdate,
  onReload,
  onNavigate,
}: Props) {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileEditVersion, setProfileEditVersion] = useState(0)
  const currentWeight = getCurrentWeight(profile, records)
  const currentBMI = getCurrentBMI(profile, records)
  const bmiCategory = getBMICategory(currentBMI)
  const bmiRange = BMI_RANGES.find(range => range.category === bmiCategory)
  const smoothedWeight = getSmoothedWeight(profile, records)
  const progress = getGoalProgress(profile.initialWeight, goal, smoothedWeight)
  const getBmiPercent = (bmi: number) => {
    if (bmi < 18.5) return (bmi / 18.5) * 18.5
    if (bmi < 24) return 18.5 + ((bmi - 18.5) / (24 - 18.5)) * 31.5
    if (bmi < 28) return 50 + ((bmi - 24) / (28 - 24)) * 25
    return 75 + Math.min(25, ((bmi - 28) / 7) * 25)
  }
  const bmiPercent = Math.min(100, Math.max(0, getBmiPercent(currentBMI)))

  const handleProfileEditingChange = (value: boolean) => {
    if (value) {
      setProfileEditVersion(version => version + 1)
    }
    setIsEditingProfile(value)
  }

  return (
    <div className="app-page bg-[var(--carbon-bg)]">
      <main className="app-main flex flex-col gap-4 px-4 pb-8 pt-4">
        <section
          className="flex flex-col items-center gap-2 py-4 text-center cursor-pointer transition-opacity hover:opacity-80 active:opacity-60"
          onClick={() => onNavigate('edit-user-info')}
        >
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Avatar"
                className="h-20 w-20 rounded-full border border-[var(--carbon-border)] object-cover bg-white"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] text-[var(--carbon-primary)]">
                <span className="i-lucide-user-round h-8 w-8" />
              </div>
            )}
            <div
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--carbon-surface)] bg-[var(--carbon-primary)] text-[var(--carbon-text-on-primary)] shadow-sm"
              aria-label="编辑个人资料"
            >
              <span className="i-lucide-pencil h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-medium text-[var(--carbon-text)]">
              {profile.nickname || '本地用户'}
            </h2>
            <p className="text-sm text-[var(--carbon-text-secondary)]">
              稳步记录，持续接近你的健康目标
            </p>
          </div>
        </section>

        <ProfileGoalSection
          goal={goal}
          currentWeight={currentWeight}
          progress={progress}
          onSaveGoal={onSaveGoal}
        />
        <ProfileBMISection
          currentBMI={currentBMI}
          bmiPercent={bmiPercent}
          bmiLabel={bmiRange?.label}
          bmiDescription={bmiRange?.description}
        />
        <ProfileBasicsSection
          key={profileEditVersion}
          profile={profile}
          isEditing={isEditingProfile}
          onEditingChange={handleProfileEditingChange}
          onProfileUpdate={onProfileUpdate}
        />
        <ProfileDataSection onReload={onReload} />
        <ProfileMilestonesSection milestones={milestones} />
      </main>
    </div>
  )
}
