import { usePwaStatus } from '@/hooks/usePwaStatus'
import { useI18n } from 'virtual:ai-i18n'

export default function PwaUpdateBanner() {
  const { needRefresh, offlineReady, applyUpdate, dismissUpdateNotice } = usePwaStatus()
  const { t } = useI18n()

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="fixed inset-x-0 bottom-[calc(var(--app-tabbar-height)+12px)] z-40 mx-auto w-full max-w-[430px] px-4">
      <div className="flex items-center gap-3 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-3 shadow-lg">
        <span
          className={`h-5 w-5 shrink-0 ${
            needRefresh
              ? 'i-lucide-refresh-cw text-[var(--carbon-primary)]'
              : 'i-lucide-wifi-off text-[var(--color-success)]'
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--carbon-text)]">
            {needRefresh ? t('发现新版本') : t('已支持离线使用')}
          </p>
          <p className="text-xs text-[var(--carbon-text-secondary)]">
            {needRefresh ? t('更新后即可使用最新功能。') : t('断网时也能打开应用查看本地数据。')}
          </p>
        </div>
        {needRefresh && (
          <button
            className="h-8 shrink-0 bg-[var(--carbon-primary)] px-3 text-xs font-medium text-[var(--carbon-text-on-primary)]"
            onClick={() => applyUpdate(true)}
          >
            {t('更新')}
          </button>
        )}
        <button
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[var(--carbon-text-secondary)]"
          title={t('关闭')}
          onClick={dismissUpdateNotice}
        >
          <span className="i-lucide-x h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
