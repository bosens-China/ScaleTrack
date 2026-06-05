import type { ThemeType } from '@/hooks/useTheme'
import { useTheme } from '@/hooks/useTheme'

export default function ProfileSettingsSection() {
  const { theme, setTheme } = useTheme()

  const THEMES: { label: string; value: ThemeType; icon: string }[] = [
    { label: '跟随系统', value: 'auto', icon: 'i-lucide-monitor' },
    { label: '浅色模式', value: 'light', icon: 'i-lucide-sun' },
    { label: '深色模式', value: 'dark', icon: 'i-lucide-moon' },
  ]

  return (
    <section className="flex flex-col gap-4">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
        系统设置
      </h3>
      <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="i-lucide-palette h-5 w-5 text-[var(--carbon-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--carbon-text)]">外观主题</p>
              <p className="text-xs text-[var(--carbon-text-secondary)]">切换深浅色模式</p>
            </div>
          </div>

          <div className="flex items-center bg-[var(--carbon-surface-subtle)] p-0.5 rounded-md border border-[var(--carbon-border)]">
            {THEMES.map(({ label, value, icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className={`flex h-7 w-9 items-center justify-center rounded transition-colors ${
                  theme === value
                    ? 'bg-[var(--carbon-surface)] text-[var(--carbon-primary)] shadow-sm'
                    : 'text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]'
                }`}
              >
                <span className={`${icon} h-4 w-4`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
