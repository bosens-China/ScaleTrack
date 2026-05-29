import { BMI_RANGES } from '../utils/bmi'

export default function BMILegend() {
  return (
    <div className="card p-5 shadow-lg shadow-[var(--c-card-shadow)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
          <span className="i-lucide-info text-primary-600 text-sm" />
        </div>
        <h2 className="font-sans font-semibold text-[var(--c-text)]">BMI 说明</h2>
      </div>

      <div className="text-xs text-[var(--c-text-secondary)] mb-4 font-mono tracking-wider">
        BMI = 体重(kg) ÷ 身高(m)²
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {BMI_RANGES.map(range => (
          <div
            key={range.category}
            className="p-3 rounded-2xl transition-colors"
            style={{ backgroundColor: `${range.color}0a` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: range.color }} />
              <span className="text-sm font-semibold" style={{ color: range.color }}>
                {range.label}
              </span>
            </div>
            <div className="text-xs text-[var(--c-text-secondary)]">
              {range.max === null ? `≥ ${range.min}` : `${range.min} ~ ${range.max}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
