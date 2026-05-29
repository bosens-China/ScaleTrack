import { useEffect, useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
}

// 拟物风格毛玻璃确认对话框组件（中文注释）
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  isDanger = false,
}: Props) {
  const [mounted, setMounted] = useState(isOpen)
  const [animate, setAnimate] = useState(false)

  // 使用 React 推荐的“渲染中调整状态”模式，消除 useEffect 中同步 setState 导致的性能隐患
  if (isOpen && !mounted) {
    setMounted(true)
  }

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>
    let timerId2: ReturnType<typeof setTimeout>
    if (isOpen) {
      timerId = setTimeout(() => setAnimate(true), 30)
    } else {
      // 异步调用以避免 react-hooks/set-state-in-effect 错误
      timerId = setTimeout(() => setAnimate(false), 0)
      timerId2 = setTimeout(() => setMounted(false), 200)
    }
    return () => {
      clearTimeout(timerId)
      clearTimeout(timerId2)
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* 磨砂背景遮罩 */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-200 ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* 对话框卡片 */}
      <div
        className={`relative w-full max-w-[340px] bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-[28px] border border-white/20 dark:border-stone-800/40 p-5 shadow-2xl transition-all duration-300 ${
          animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h4 className="font-sans font-bold text-base text-stone-800 dark:text-stone-100 mb-2">
          {title}
        </h4>
        <p className="font-body text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-5">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 min-h-[40px] text-xs font-body font-medium rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/40 active:scale-[0.97] transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 min-h-[40px] text-xs font-body font-medium rounded-xl text-white active:scale-[0.97] transition-all cursor-pointer shadow-md ${
              isDanger
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10'
                : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/10'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
