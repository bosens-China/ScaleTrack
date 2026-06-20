import { useState } from 'react'

import dayjs from 'dayjs'

import BirthDatePickerModal from '@/components/BirthDatePickerModal'
import TextInput from '@/components/TextInput'

import { useWeightUnit } from '@/hooks/weight-unit-context'
import type { UserProfile } from '@/types'
import { getProfileAge } from '@/utils/age'
import { toast } from '@/utils/toast'
import { validateHeight } from '@/utils/validation'
import { formatWeight } from '@/utils/weight-unit'

interface Props {
  profile: UserProfile
  isEditing: boolean
  onEditingChange: (value: boolean) => void
  onProfileUpdate: (patch: Partial<UserProfile>) => void
}

/** 基础资料区块内部处理表单态，避免页面文件继续膨胀。 */
export default function ProfileBasicsSection({
  profile,
  isEditing,
  onEditingChange,
  onProfileUpdate,
}: Props) {
  const { unit } = useWeightUnit()
  const [heightInput, setHeightInput] = useState(String(profile.height))
  const [birthDateInput, setBirthDateInput] = useState<string | undefined>(profile.birthDate)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [genderInput, setGenderInput] = useState<UserProfile['gender']>(profile.gender)

  const handleToggleProfileEdit = () => {
    if (isEditing) {
      onEditingChange(false)
      return
    }
    onEditingChange(true)
  }

  const handleSave = () => {
    const parsedHeight = Number.parseFloat(heightInput)
    if (!validateHeight(parsedHeight)) {
      toast.error('请输入有效的身高')
      return
    }
    onProfileUpdate({ gender: genderInput, height: parsedHeight, birthDate: birthDateInput })
    onEditingChange(false)
  }

  return (
    <section className="flex flex-col gap-4">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
        基础信息
      </h3>
      <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
        {isEditing ? (
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
            <TextInput
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
              placeholder="身高（cm）"
            />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
                出生年月日
              </span>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="flex h-12 w-full items-center justify-between border-b border-[var(--carbon-border)] bg-[var(--carbon-bg)] px-3 text-sm transition-colors hover:bg-[var(--carbon-surface-variant)]"
              >
                <span
                  className={
                    birthDateInput
                      ? 'text-[var(--carbon-text)]'
                      : 'text-[var(--carbon-text-secondary)]'
                  }
                >
                  {birthDateInput
                    ? dayjs(birthDateInput).format('YYYY年 MM月 DD日')
                    : '请选择出生日期'}
                </span>
                <span className="i-lucide-calendar h-4 w-4 text-[var(--carbon-text-secondary)]" />
              </button>
              <BirthDatePickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                value={birthDateInput}
                onChange={setBirthDateInput}
              />
            </div>
            <button
              onClick={handleSave}
              className="h-12 w-full bg-[var(--carbon-primary)] text-sm font-medium text-[var(--carbon-text-on-primary)] hover:bg-[var(--carbon-primary-hover)]"
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
            <div className="flex items-center justify-between border-b border-[var(--carbon-border)] p-4">
              <div className="flex items-center gap-4">
                <span className="i-lucide-calendar h-5 w-5 text-[var(--carbon-text-secondary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--carbon-text)]">年龄</p>
                  <p className="text-xs text-[var(--carbon-text-secondary)]">
                    {getProfileAge(profile) !== undefined
                      ? `${getProfileAge(profile)} 岁`
                      : '未设置'}
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
                    {formatWeight(profile.initialWeight, unit)}
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
