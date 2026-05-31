import { useState } from 'react'

import type { UserProfile } from '../../types'
import { toast } from '../../utils/toast'
import { validateHeight } from '../../utils/validation'

interface Props {
  profile: UserProfile
  onProfileUpdate: (patch: Partial<UserProfile>) => void
}

/** 基础资料区块内部处理表单态，避免页面文件继续膨胀。 */
export default function ProfileBasicsSection({ profile, onProfileUpdate }: Props) {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [heightInput, setHeightInput] = useState(String(profile.height))
  const [genderInput, setGenderInput] = useState<UserProfile['gender']>(profile.gender)

  const handleToggleProfileEdit = () => {
    if (isEditingProfile) {
      setIsEditingProfile(false)
      return
    }

    setHeightInput(String(profile.height))
    setGenderInput(profile.gender)
    setIsEditingProfile(true)
  }

  const handleSave = () => {
    const parsed = Number.parseFloat(heightInput)
    if (!validateHeight(parsed)) {
      toast.error('请输入有效的身高')
      return
    }

    onProfileUpdate({ gender: genderInput, height: parsed })
    setIsEditingProfile(false)
  }

  return (
    <section className="flex flex-col gap-4">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
        基础信息
      </h3>
      <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
        {isEditingProfile ? (
          <div className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as const).map(value => (
                <button
                  key={value}
                  onClick={() => setGenderInput(value)}
                  className={`h-11 border text-sm ${
                    genderInput === value
                      ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)]'
                      : 'border-[var(--carbon-border)] text-[var(--carbon-text-secondary)]'
                  }`}
                >
                  {value === 'male' ? '男' : '女'}
                </button>
              ))}
            </div>
            <input
              type="number"
              inputMode="decimal"
              value={heightInput}
              onChange={event => setHeightInput(event.target.value)}
              onFocus={event =>
                setTimeout(
                  () => event.target.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                  300,
                )
              }
              className="h-12 w-full border-b border-[var(--carbon-outline)] bg-[var(--carbon-surface-subtle)] px-4 text-sm outline-none focus:border-[var(--carbon-primary)]"
              placeholder="身高（cm）"
            />
            <button
              onClick={handleSave}
              className="h-12 w-full bg-[var(--carbon-primary)] text-sm font-medium text-white hover:bg-[var(--carbon-primary-hover)]"
            >
              保存基础信息
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-[var(--carbon-border)] p-4">
              <div className="flex items-center gap-4">
                <span className="i-lucide-stretch-horizontal h-5 w-5 text-[var(--carbon-text-secondary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--carbon-text)]">身高</p>
                  <p className="text-xs text-[var(--carbon-text-secondary)]">{profile.height} cm</p>
                </div>
              </div>
              <button
                onClick={handleToggleProfileEdit}
                className="text-sm font-medium text-[var(--carbon-primary)]"
              >
                更改
              </button>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--carbon-border)] p-4">
              <div className="flex items-center gap-4">
                <span className="i-lucide-users h-5 w-5 text-[var(--carbon-text-secondary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--carbon-text)]">性别</p>
                  <p className="text-xs text-[var(--carbon-text-secondary)]">
                    {profile.gender === 'male' ? '男' : '女'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <span className="i-lucide-scale h-5 w-5 text-[var(--carbon-text-secondary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--carbon-text)]">初始体重</p>
                  <p className="text-xs text-[var(--carbon-text-secondary)]">
                    {profile.initialWeight.toFixed(1)} kg
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
