import { useId, useState } from 'react'
import type { Gender, UserProfile } from '../types'
import { BMI_RANGES, calcBMI, getBMICategory, getBMIColor } from '../utils/bmi'
import { saveProfile } from '../utils/storage'
import { validateHeight, validateWeight, VALIDATION_LIMITS } from '../utils/validation'

interface Props {
  onComplete: (profile: UserProfile) => void
}

export default function SetupPage({ onComplete }: Props) {
  const heightId = useId()
  const weightId = useId()
  const [gender, setGender] = useState<Gender>('male')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [error, setError] = useState('')

  const heightNum = parseFloat(height)
  const weightNum = parseFloat(weight)
  const bmi = heightNum > 0 && weightNum > 0 ? calcBMI(weightNum, heightNum) : null

  const handleSubmit = () => {
    if (!validateHeight(heightNum)) {
      setError(VALIDATION_LIMITS.height.errorMsg)
      return
    }
    if (!validateWeight(weightNum)) {
      setError(VALIDATION_LIMITS.weight.errorMsg)
      return
    }

    const profile: UserProfile = {
      gender,
      height: heightNum,
      initialWeight: weightNum,
      createdAt: new Date().toISOString(),
    }
    saveProfile(profile)
    onComplete(profile)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-[var(--c-bg)]">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-18 h-18 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/20 animate-scale-in">
            <span className="i-lucide-scale text-white w-9 h-9" />
          </div>
          <h1 className="font-sans text-[28px] font-extrabold tracking-tight text-[var(--c-text)]">
            ScaleTrack
          </h1>
          <p className="text-sm text-[var(--c-text-secondary)] mt-2">开始追踪你的体重变化</p>
        </div>

        {/* Form (精细调优的现代 Flex 布局与黄金网格间距) */}
        <div className="card p-6 flex flex-col gap-6 shadow-xl shadow-[var(--c-card-shadow)] bg-[var(--c-card)]">
          {/* Gender */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold text-[var(--c-text-secondary)] uppercase tracking-wider">
              性别
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`btn flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-solid transition-all duration-200 ${
                    gender === g
                      ? 'border-primary-500 bg-primary-500/8 text-primary-600 dark:text-primary-300 shadow-sm shadow-primary-500/10 font-bold'
                      : 'border-[var(--c-border)] bg-transparent text-[var(--c-text-secondary)] hover:border-[var(--c-text-secondary)]/40'
                  }`}
                >
                  <span
                    className={
                      g === 'male'
                        ? 'i-lucide-user text-emerald-500'
                        : 'i-lucide-user-round text-rose-500'
                    }
                  />
                  {g === 'male' ? '男' : '女'}
                </button>
              ))}
            </div>
          </div>

          {/* Height */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={heightId}
              className="block text-xs font-bold text-[var(--c-text-secondary)] uppercase tracking-wider"
            >
              身高 (cm)
            </label>
            <input
              id={heightId}
              type="number"
              inputMode="decimal"
              placeholder="例如：170"
              value={height}
              onChange={e => {
                setHeight(e.target.value)
                setError('')
              }}
              className="input text-sm"
            />
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={weightId}
              className="block text-xs font-bold text-[var(--c-text-secondary)] uppercase tracking-wider"
            >
              当前体重 (kg)
            </label>
            <input
              id={weightId}
              type="number"
              inputMode="decimal"
              placeholder="例如：65"
              value={weight}
              onChange={e => {
                setWeight(e.target.value)
                setError('')
              }}
              className="input text-sm"
            />
          </div>

          {/* BMI Preview */}
          {bmi !== null && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--c-bg-secondary)] to-[var(--c-bg)] text-center border border-solid border-[var(--c-border)]/50 animate-scale-in">
              <div className="text-[10px] font-bold text-[var(--c-text-secondary)] mb-1 tracking-wide uppercase">
                当前 BMI
              </div>
              <div
                className="text-[32px] font-sans font-extrabold leading-none"
                style={{ color: getBMIColor(bmi) }}
              >
                {bmi}
              </div>
              <div className="text-xs mt-1.5 font-bold" style={{ color: getBMIColor(bmi) }}>
                {BMI_RANGES.find(r => r.category === getBMICategory(bmi))?.description}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs font-body font-bold text-danger text-center animate-fade-in">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="btn-primary w-full py-3.5 text-sm font-bold tracking-wide"
          >
            开始记录
          </button>
        </div>
      </div>
    </div>
  )
}
