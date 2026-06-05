import { useState } from 'react'

import ProfileAboutSection from '@/components/profile/ProfileAboutSection'
import ProfileBasicsSection from '@/components/profile/ProfileBasicsSection'
import ProfileBMISection from '@/components/profile/ProfileBMISection'
import ProfileDataSection from '@/components/profile/ProfileDataSection'
import ProfileGoalSection from '@/components/profile/ProfileGoalSection'
import ProfileMilestonesSection from '@/components/profile/ProfileMilestonesSection'
import ProfileSettingsSection from '@/components/profile/ProfileSettingsSection'
import type { AppPage, Goal, UserProfile, WeightRecord } from '@/types'
import { BMI_RANGES, getBMICategory, getBmiPercent } from '@/utils/bmi'
import { getCurrentBMI, getCurrentWeight, getGoalProgress } from '@/utils/stats'

interface Props {
  profile: UserProfile
  records: WeightRecord[]
  goal: Goal | null
  milestones: Goal[]
  onSaveGoal: (targetWeight: number) => void
  onProfileUpdate: (patch: Partial<UserProfile>) => void
  onReload: () => void
  onNavigate: (page: AppPage) => void
  onSelectMilestone: (id: string) => void
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
  onSelectMilestone,
}: Props) {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileEditVersion, setProfileEditVersion] = useState(0)
  const currentWeight = getCurrentWeight(profile, records)
  const currentBMI = getCurrentBMI(profile, records)
  const bmiCategory = getBMICategory(currentBMI)
  const bmiRange = BMI_RANGES.find(range => range.category === bmiCategory)
  const progress = getGoalProgress(goal, currentWeight, records)
  const bmiPercent = getBmiPercent(currentBMI)

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
        <ProfileMilestonesSection
          milestones={milestones}
          onNavigate={onNavigate}
          onSelectMilestone={onSelectMilestone}
        />
        <ProfileDataSection onReload={onReload} />
        <ProfileSettingsSection />
        <ProfileAboutSection />
      </main>
    </div>
  )
}
