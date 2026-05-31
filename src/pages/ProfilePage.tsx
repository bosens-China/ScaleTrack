import ProfileBasicsSection from '../components/profile/ProfileBasicsSection'
import ProfileBMISection from '../components/profile/ProfileBMISection'
import ProfileDataSection from '../components/profile/ProfileDataSection'
import ProfileGoalSection from '../components/profile/ProfileGoalSection'
import ProfileMilestonesSection from '../components/profile/ProfileMilestonesSection'

import type { Goal, UserProfile, WeightRecord } from '../types'
import { BMI_RANGES, getBMICategory } from '../utils/bmi'
import { getCurrentBMI, getCurrentWeight, getGoalProgress } from '../utils/stats'

interface Props {
  profile: UserProfile
  records: WeightRecord[]
  goal: Goal | null
  milestones: Goal[]
  onSaveGoal: (targetWeight: number) => void
  onProfileUpdate: (patch: Partial<UserProfile>) => void
  onReload: () => void
}

export default function ProfilePage({
  profile,
  records,
  goal,
  milestones,
  onSaveGoal,
  onProfileUpdate,
  onReload,
}: Props) {
  const currentWeight = getCurrentWeight(profile, records)
  const currentBMI = getCurrentBMI(profile, records)
  const bmiCategory = getBMICategory(currentBMI)
  const bmiRange = BMI_RANGES.find(range => range.category === bmiCategory)
  const progress = getGoalProgress(goal, currentWeight)
  const bmiPercent = Math.min(100, Math.max(0, (currentBMI / 35) * 100))

  return (
    <div className="app-page bg-[var(--carbon-bg)]">
      <main className="app-main flex flex-col gap-4 px-4 pb-8 pt-4">
        <section className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] text-[var(--carbon-primary)]">
              <span className="i-lucide-user-round h-8 w-8" />
            </div>
            <button
              onClick={handleToggleProfileEdit}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--carbon-surface)] bg-[var(--carbon-primary)] text-white shadow-sm"
              aria-label="编辑基础信息"
            >
              <span className="i-lucide-pencil h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-medium text-[var(--carbon-text)]">本地用户</h2>
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
        <ProfileBasicsSection profile={profile} onProfileUpdate={onProfileUpdate} />
        <ProfileDataSection onReload={onReload} />
        <ProfileMilestonesSection milestones={milestones} />
      </main>
    </div>
  )
}
