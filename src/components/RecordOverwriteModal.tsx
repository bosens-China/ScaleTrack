import { useEffect } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import ModalPortal from './ModalPortal'

interface Props {
  isOpen: boolean
  title: string
  description: string
  existingSummary: string
  nextSummary: string
  onCancel: () => void
  onConfirm: () => void
}

/** 体重和运动共用的覆盖确认弹窗，确保破坏性写入拥有一致的二次确认体验。 */
export default function RecordOverwriteModal({
  isOpen,
  title,
  description,
  existingSummary,
  nextSummary,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useI18n()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <ModalPortal>
      <button
        type="button"
        className="app-modal-layer fixed inset-0 h-full w-full bg-black/65 backdrop-blur-sm"
        onClick={onCancel}
        aria-label={t('取消覆盖')}
      />
      <div
        className="app-modal-layer fixed inset-x-4 top-1/2 mx-auto w-auto max-w-[398px] -translate-y-1/2 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-5 shadow-2xl animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-overwrite-title"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)]">
            <span className="i-lucide-files h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="sport-kicker">{t('发现同日记录')}</p>
            <h2
              id="record-overwrite-title"
              className="mt-1 text-xl font-black tracking-tight text-[var(--carbon-text)]"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--carbon-text-secondary)]">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-px border border-[var(--carbon-border)] bg-[var(--carbon-border)]">
          <div className="bg-[var(--carbon-surface-subtle)] px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--carbon-text-secondary)]">
              {t('已有记录')}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--carbon-text)]">
              {existingSummary}
            </p>
          </div>
          <div className="bg-[var(--carbon-primary-soft)] px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--carbon-primary)]">
              {t('覆盖为')}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--carbon-text)]">{nextSummary}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="h-12 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] text-sm font-bold text-[var(--carbon-text-secondary)] hover:bg-[var(--carbon-surface-subtle)]"
          >
            {t('保留原记录')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 bg-[var(--carbon-primary)] text-sm font-black text-[var(--carbon-text-on-primary)] hover:bg-[var(--carbon-primary-hover)]"
          >
            {t('确认覆盖')}
          </button>
        </div>
      </div>
    </ModalPortal>
  )
}
