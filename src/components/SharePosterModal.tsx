import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { generateShareImage, processShareOrDownload } from '@/utils/share'
import { toast } from '@/utils/toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  filenamePrefix?: string
}

export default function SharePosterModal({
  isOpen,
  onClose,
  children,
  filenamePrefix = 'scaletrack',
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  // 当弹窗打开时，可以先清理之前的 dataUrl
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setDataUrl(null), 0)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAction = async () => {
    if (!cardRef.current) return
    setSaving(true)
    try {
      // 捕获为图片
      const url = await generateShareImage(cardRef.current)
      setDataUrl(url)

      // 触发分享或下载
      const filename = `${filenamePrefix}-${dayjs().format('YYYYMMDDHHmmss')}.png`
      await processShareOrDownload(url, filename)
    } catch (err) {
      console.error('Failed to generate image', err)
      toast.error('分享海报生成失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-start overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:justify-center">
      {/* 顶部操作区 */}
      <div className="flex w-full max-w-sm justify-end mb-4">
        <button
          type="button"
          aria-label="关闭分享海报"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
        >
          <span className="i-lucide-x h-5 w-5" />
        </button>
      </div>

      {/* 海报预览区 */}
      <div className="w-full max-w-sm overflow-hidden rounded-sm bg-white shadow-2xl relative">
        <div ref={cardRef} className="share-poster flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--carbon-border)]">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--carbon-primary)] text-white">
                <span className="i-lucide-activity h-4 w-4" />
              </div>
              <span className="font-semibold tracking-wide text-[var(--carbon-text)]">
                ScaleTrack
              </span>
            </div>
            <span className="text-xs text-[var(--carbon-text-secondary)]">
              {dayjs().format('YYYY / MM / DD')}
            </span>
          </div>

          {/* 主内容区 */}
          <div className="flex flex-col">{children}</div>

          {/* Footer */}
          <div className="flex items-center justify-center bg-[var(--carbon-surface-subtle)] py-3">
            <span className="text-[10px] uppercase tracking-widest text-[var(--carbon-text-secondary)]">
              - 记录身体每一次改变 -
            </span>
          </div>
        </div>

        {/* 如果已经生成了 Base64，可以覆盖在上面，方便用户在某些浏览器中直接长按保存 */}
        {dataUrl && (
          <img
            src={dataUrl}
            alt="分享海报"
            className="absolute inset-0 h-full w-full object-cover opacity-0 pointer-events-auto"
            style={{ zIndex: 10 }}
          />
        )}
      </div>

      {/* 底部按钮 */}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={handleAction}
          disabled={saving}
          className="flex h-12 w-full items-center justify-center gap-2 bg-[var(--carbon-primary)] text-base font-semibold text-white shadow-lg transition-colors hover:bg-[var(--carbon-primary-hover)] rounded-sm disabled:opacity-50"
        >
          {saving ? (
            <span className="i-lucide-loader-2 h-5 w-5 animate-spin" />
          ) : (
            <span className="i-lucide-share h-5 w-5" />
          )}
          {saving ? '正在生成...' : '分享或保存'}
        </button>
        {dataUrl && (
          <p className="text-center text-xs text-white/70">
            提示：如果没有弹出分享，可以尝试长按上方海报直接保存
          </p>
        )}
      </div>
    </div>,
    document.body,
  )
}
