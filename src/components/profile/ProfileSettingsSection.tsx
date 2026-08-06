import type { ThemeType } from '@/hooks/useTheme'
import { useTheme } from '@/hooks/useTheme'
import { useWeightUnit } from '@/hooks/weight-unit-context'
import { getWeightUnitLabel } from '@/utils/weight-unit'
import { useI18n } from 'virtual:ai-i18n'

export default function ProfileSettingsSection() {
  const { theme, setTheme } = useTheme()
  const { unit, setUnit } = useWeightUnit()
  const { currentLang, langs, setLang, t } = useI18n()

  const themes: { label: string; value: ThemeType; icon: string }[] = [
    { label: t('跟随系统'), value: 'auto', icon: 'i-lucide-monitor' },
    { label: t('浅色模式'), value: 'light', icon: 'i-lucide-sun' },
    { label: t('深色模式'), value: 'dark', icon: 'i-lucide-moon' },
  ]

  return (
    <section className="flex flex-col gap-4">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
        {t('系统设置')}
      </h3>
      <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="i-lucide-palette h-5 w-5 text-[var(--carbon-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--carbon-text)]">{t('外观主题')}</p>
              <p className="text-xs text-[var(--carbon-text-secondary)]">{t('切换深浅色模式')}</p>
            </div>
          </div>

          <div className="flex items-center bg-[var(--carbon-surface-subtle)] p-0.5 rounded-md border border-[var(--carbon-border)]">
            {themes.map(({ label, value, icon }) => (
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

        <div className="mt-4 flex items-center justify-between border-t border-[var(--carbon-border)] pt-4">
          <div className="flex items-center gap-4">
            <span className="i-lucide-scale h-5 w-5 text-[var(--carbon-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--carbon-text)]">{t('体重单位')}</p>
              <p className="text-xs text-[var(--carbon-text-secondary)]">
                {t('切换体重展示与录入单位')}
              </p>
            </div>
          </div>

          <div className="flex items-center rounded-md border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] p-0.5">
            {(['kg', 'jin'] as const).map(value => (
              <button
                key={value}
                onClick={() => setUnit(value)}
                className={`flex h-7 items-center justify-center rounded px-3 text-xs font-medium transition-colors ${
                  unit === value
                    ? 'bg-[var(--carbon-surface)] text-[var(--carbon-primary)] shadow-sm'
                    : 'text-[var(--carbon-text-secondary)] hover:text-[var(--carbon-text)]'
                }`}
              >
                {value === 'kg' ? t('公斤 kg') : getWeightUnitLabel(value)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--carbon-border)] pt-4">
          <div className="flex items-center gap-4">
            <span className="i-lucide-languages h-5 w-5 text-[var(--carbon-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--carbon-text)]">{t('界面语言')}</p>
              <p className="text-xs text-[var(--carbon-text-secondary)]">{t('立即切换显示语言')}</p>
            </div>
          </div>

          <select
            aria-label={t('界面语言')}
            value={currentLang}
            onChange={event => void setLang(event.target.value)}
            className="h-8 border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] px-2 text-xs text-[var(--carbon-text)] outline-none focus:border-[var(--carbon-primary)]"
          >
            {langs.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
