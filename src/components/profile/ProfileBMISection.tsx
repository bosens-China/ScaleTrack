import { BMI_RANGES } from '@/utils/bmi'

interface Props {
  currentBMI: number
  bmiPercent: number
  bmiLabel?: string
  bmiDescription?: string
}

export default function ProfileBMISection({
  currentBMI,
  bmiPercent,
  bmiLabel = '正常',
  bmiDescription = '保持健康体重可以降低健康风险。',
}: Props) {
  const [underweight, normal, overweight, obese] = BMI_RANGES

  return (
    <section className="flex flex-col gap-4 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4">
      <div className="flex items-center justify-between border-b border-[var(--carbon-border)] pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
          BMI 信息
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-[var(--carbon-primary)]">
            {currentBMI.toFixed(1)}
          </span>
          <span className="bg-[var(--carbon-primary-soft)] px-2 py-0.5 text-xs text-[var(--carbon-primary)]">
            {bmiLabel}
          </span>
        </div>
      </div>

      <div className="relative pb-6 pt-4">
        <div className="flex h-2 w-full">
          <div className="h-full w-[18.5%]" style={{ backgroundColor: underweight.color }} />
          <div className="h-full w-[31.5%]" style={{ backgroundColor: normal.color }} />
          <div className="h-full w-[25%]" style={{ backgroundColor: overweight.color }} />
          <div className="h-full w-[25%]" style={{ backgroundColor: obese.color }} />
        </div>
        <div
          className="absolute top-5 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
          style={{ left: `${bmiPercent}%` }}
        >
          <div className="h-5 w-1.5 rounded-full border border-black/10 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3)] dark:border-white/10 dark:bg-[var(--carbon-text)]" />
        </div>
        <div
          className="absolute top-8 w-[18.5%] text-center text-[10px] text-[var(--carbon-outline)]"
          style={{ left: '0%' }}
        >
          &lt; 18.5
        </div>
        <div
          className="absolute top-8 w-[31.5%] text-center text-[10px] text-[var(--carbon-outline)]"
          style={{ left: '18.5%' }}
        >
          18.5 - 24
        </div>
        <div
          className="absolute top-8 w-[25%] text-center text-[10px] text-[var(--carbon-outline)]"
          style={{ left: '50%' }}
        >
          24 - 28
        </div>
        <div
          className="absolute top-8 w-[25%] text-center text-[10px] text-[var(--carbon-outline)]"
          style={{ left: '75%' }}
        >
          28+
        </div>
      </div>

      <div className="border-l-4 border-[var(--carbon-primary)] bg-[var(--carbon-surface-subtle)] p-3">
        <div className="flex items-start gap-3">
          <span className="i-lucide-info h-4 w-4 shrink-0 text-[var(--carbon-primary)]" />
          <p className="text-sm leading-6 text-[var(--carbon-text)]">
            您的 BMI 处于 <span className="font-semibold">{bmiLabel}</span> 范围。{bmiDescription}
          </p>
        </div>
      </div>
    </section>
  )
}
