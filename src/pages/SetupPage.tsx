import { useId, useState } from 'react'

import WeightRulerPicker from '../components/WeightRulerPicker'
import type { Gender, UserProfile } from '../types'
import { BMI_RANGES, calcBMI, getBMICategory, getBMIColor } from '../utils/bmi'
import { validateHeight, validateWeight, VALIDATION_LIMITS } from '../utils/validation'

interface Props {
  onComplete: (profile: UserProfile) => void
}

export default function SetupPage({ onComplete }: Props) {
  const heightId = useId()
  const weightId = useId()
  const [gender, setGender] = useState<Gender>('male')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState(60.0)
  const [error, setError] = useState('')

  const heightNum = parseFloat(height)
  const weightNum = weight
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
    onComplete(profile)
  }

  return (
    <div className="app-page bg-[var(--carbon-bg)]">
      <div className="app-main mx-auto w-full max-w-[430px] px-4">
        <div className="animate-fade-in-up flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-3 border-b border-[var(--carbon-border)] pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
              首次使用
            </p>
            <h2 className="text-[28px] font-light tracking-tight text-[var(--carbon-text)]">
              完善基础资料
            </h2>
            <p className="text-sm leading-6 text-[var(--carbon-text-secondary)]">
              只需要填写一次。后续记录体重、计算 BMI 和追踪目标都会基于这些资料。
            </p>
          </div>

          <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-6">
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
                性别
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex h-12 items-center justify-center gap-2 border text-sm transition-colors ${
                      gender === g
                        ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] font-semibold text-[var(--carbon-primary)]'
                        : 'border-[var(--carbon-border)] text-[var(--carbon-text-secondary)] hover:bg-[var(--carbon-surface-variant)]'
                    }`}
                  >
                    <span
                      className={
                        g === 'male'
                          ? 'i-lucide-user text-[#198038]'
                          : 'i-lucide-user-round text-[#da1e28]'
                      }
                    />
                    {g === 'male' ? '男' : '女'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <label
                htmlFor={heightId}
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]"
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
                className="h-12 w-full border-b border-[var(--carbon-outline)] bg-[var(--carbon-surface-subtle)] px-4 text-sm text-[var(--carbon-text)] outline-none transition-colors focus:border-[var(--carbon-primary)]"
              />
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <label
                htmlFor={weightId}
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]"
              >
                当前体重 (kg)
              </label>
              <div className="mb-4 mt-2 flex items-baseline justify-center">
                <span className="text-[64px] font-light leading-none text-[var(--carbon-text)]">
                  {weight.toFixed(1)}
                </span>
                <span className="ml-1 text-lg text-[var(--carbon-text-secondary)]">kg</span>
              </div>
              <div className="-mx-4">
                <WeightRulerPicker
                  value={weight}
                  onChange={w => {
                    setWeight(w)
                    setError('')
                  }}
                />
              </div>
            </div>

            {bmi !== null && (
              <div className="mt-6 border-l-4 border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] p-4 animate-scale-in">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
                  当前 BMI
                </div>
                <div
                  className="text-[32px] font-light leading-none"
                  style={{ color: getBMIColor(bmi) }}
                >
                  {bmi}
                </div>
                <div className="mt-2 text-xs" style={{ color: getBMIColor(bmi) }}>
                  {BMI_RANGES.find(r => r.category === getBMICategory(bmi))?.description}
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 text-xs font-medium text-[#da1e28] animate-fade-in">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              className="mt-8 flex h-14 w-full items-center justify-between bg-[var(--carbon-primary)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--carbon-primary-hover)]"
            >
              <span>开始记录</span>
              <span className="i-lucide-arrow-right h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
