import { usePwaStatus } from '@/hooks/usePwaStatus'
import { useI18n } from 'virtual:ai-i18n'

export default function ProfileAboutSection() {
  const { t } = useI18n()
  const {
    version,
    isSupported,
    isStandalone,
    isChecking,
    needRefresh,
    checkForUpdate,
    applyUpdate,
  } = usePwaStatus()

  return (
    <section className="flex flex-col gap-4 mt-2">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
        {t('关于 ScaleTrack')}
      </h3>
      <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
        <div className="flex w-full items-center justify-between border-b border-[var(--carbon-border)] p-4 text-left">
          <div className="flex items-center gap-4">
            <span className="i-lucide-badge-info h-5 w-5 text-[var(--carbon-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--carbon-text)]">{t('当前版本')}</p>
              <p className="text-xs text-[var(--carbon-text-secondary)]">
                v{version} ·{' '}
                {isStandalone ? t('已安装') : isSupported ? t('支持安装') : t('浏览器模式')}
              </p>
            </div>
          </div>
          <span className="rounded bg-[var(--carbon-surface-subtle)] px-2 py-1 text-[10px] font-medium text-[var(--carbon-text-secondary)]">
            PWA
          </span>
        </div>

        <button
          className="flex w-full items-center justify-between border-b border-[var(--carbon-border)] p-4 text-left transition-colors hover:bg-[var(--carbon-surface-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isChecking || !isSupported}
          onClick={() => {
            if (needRefresh) {
              void applyUpdate(true)
              return
            }
            void checkForUpdate()
          }}
        >
          <div className="flex items-center gap-4">
            <span
              className={`h-5 w-5 text-[var(--carbon-text-secondary)] ${
                isChecking ? 'i-lucide-loader-circle animate-spin' : 'i-lucide-refresh-cw'
              }`}
            />
            <div>
              <p className="text-sm font-medium text-[var(--carbon-text)]">
                {needRefresh ? t('立即更新') : t('检查更新')}
              </p>
              <p className="text-xs text-[var(--carbon-text-secondary)]">
                {needRefresh
                  ? t('新版本已准备好，点击后刷新应用')
                  : t('手动检查是否有可用的新版本')}
              </p>
            </div>
          </div>
          <span className="i-lucide-chevron-right h-4 w-4 text-[var(--carbon-outline)]" />
        </button>

        <a
          href="https://github.com/bosens-China/ScaleTrack/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--carbon-surface-subtle)] no-underline"
        >
          <div className="flex items-center gap-4">
            <span className="i-lucide-message-square h-5 w-5 text-[var(--carbon-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--carbon-text)]">{t('意见反馈')}</p>
              <p className="text-xs text-[var(--carbon-text-secondary)]">
                {t('前往 GitHub 提交 Issue 或建议')}
              </p>
            </div>
          </div>
          <span className="i-lucide-external-link h-4 w-4 text-[var(--carbon-outline)]" />
        </a>
      </div>

      <div className="text-center pb-8 pt-4">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--carbon-text)] opacity-80">
          ScaleTrack
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)] mt-1">
          Stay on track
        </p>
      </div>
    </section>
  )
}
