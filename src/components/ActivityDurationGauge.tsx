const QUICK_DURATIONS = [30, 45, 60, 90]
const MIN_DURATION = 5
const GAUGE_MAX = 180
const INPUT_MAX = 720

interface Props {
  value: number
  onChange: (value: number) => void
}

function clampDuration(value: number) {
  return Math.min(INPUT_MAX, Math.max(MIN_DURATION, value))
}

export default function ActivityDurationGauge({ value, onChange }: Props) {
  const gaugeValue = Math.min(value, GAUGE_MAX)
  const progress = (gaugeValue - MIN_DURATION) / (GAUGE_MAX - MIN_DURATION)
  const needleAngle = -90 + progress * 180

  return (
    <div className="sport-panel flex flex-col gap-3 px-4 py-5">
      <div className="relative mx-auto h-[154px] w-full max-w-[300px]">
        <svg
          viewBox="0 0 260 150"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <path
            d="M 30 130 A 100 100 0 0 1 230 130"
            pathLength="100"
            fill="none"
            stroke="var(--carbon-surface-strong)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 30 130 A 100 100 0 0 1 230 130"
            pathLength="100"
            fill="none"
            stroke="var(--sport-accent)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0, progress * 100)} 100`}
            className="transition-[stroke-dasharray] duration-200"
          />
          <line
            x1="130"
            y1="130"
            x2="130"
            y2="54"
            stroke="var(--carbon-text)"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: '130px 130px',
              transition: 'transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          />
          <circle cx="130" cy="130" r="10" fill="var(--carbon-text)" />
          <circle cx="130" cy="130" r="4" fill="var(--sport-accent)" />
        </svg>

        <label className="absolute inset-x-0 top-[58px] flex items-baseline justify-center gap-1">
          <input
            type="number"
            inputMode="numeric"
            min={MIN_DURATION}
            max={INPUT_MAX}
            step={5}
            value={value}
            onChange={event => {
              const next = Number(event.currentTarget.value)
              if (Number.isFinite(next)) onChange(clampDuration(next))
            }}
            className="sport-number-input w-24 border-0 bg-transparent p-0 text-center text-[46px] font-black leading-none text-[var(--carbon-text)]"
            aria-label="运动时长（分钟）"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
            分钟
          </span>
        </label>

        <span className="absolute bottom-0 left-3 text-[10px] font-semibold text-[var(--carbon-text-secondary)]">
          5
        </span>
        <span className="absolute bottom-0 right-1 text-[10px] font-semibold text-[var(--carbon-text-secondary)]">
          180+
        </span>
      </div>

      <input
        type="range"
        min={MIN_DURATION}
        max={GAUGE_MAX}
        step={5}
        value={gaugeValue}
        onChange={event => onChange(Number(event.currentTarget.value))}
        className="sport-range w-full"
        aria-label="拖动调整运动时长"
      />

      <div className="grid grid-cols-4 gap-2">
        {QUICK_DURATIONS.map(minutes => (
          <button
            key={minutes}
            type="button"
            onClick={() => onChange(minutes)}
            className={`min-h-11 border px-2 text-xs font-bold transition-colors ${
              value === minutes
                ? 'border-[var(--sport-accent)] bg-[var(--sport-accent)] text-[var(--sport-accent-text)]'
                : 'border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] text-[var(--carbon-text-secondary)] hover:border-[var(--carbon-primary)]'
            }`}
          >
            {minutes} 分
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onChange(clampDuration(value - 5))}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--carbon-border)] bg-[var(--carbon-surface)] text-[var(--carbon-text)] transition-colors hover:border-[var(--carbon-primary)]"
          aria-label="减少 5 分钟"
        >
          <span className="i-lucide-minus h-4 w-4" />
        </button>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]">
          每次调整 5 分钟
        </span>
        <button
          type="button"
          onClick={() => onChange(clampDuration(value + 5))}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--carbon-border)] bg-[var(--carbon-surface)] text-[var(--carbon-text)] transition-colors hover:border-[var(--carbon-primary)]"
          aria-label="增加 5 分钟"
        >
          <span className="i-lucide-plus h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
