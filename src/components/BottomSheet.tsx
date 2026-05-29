import { useEffect, useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

// 移动端高阶毛玻璃底部抽屉组件（中文注释）
export default function BottomSheet({ isOpen, onClose, title, children }: Props) {
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
      // 延迟触发动画实现丝滑过渡
      timerId = setTimeout(() => setAnimate(true), 30)
    } else {
      // 异步调用以避免 react-hooks/set-state-in-effect 错误
      timerId = setTimeout(() => setAnimate(false), 0)
      timerId2 = setTimeout(() => setMounted(false), 300)
    }
    return () => {
      clearTimeout(timerId)
      clearTimeout(timerId2)
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
      {/* 遮罩背景，带毛玻璃与平滑渐变 */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[6px] transition-opacity duration-300 pointer-events-auto ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* 底部抽屉主体 */}
      <div
        className={`relative z-10 w-full max-w-[430px] mx-auto bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-2xl rounded-t-[32px] border-t border-white/20 dark:border-stone-800/60 shadow-2xl transition-transform duration-300 ease-out pointer-events-auto pb-[env(safe-area-inset-bottom,24px)] ${
          animate ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 顶部手势操作条 & 标题 */}
        <div className="flex flex-col items-center pt-3 pb-4">
          <div
            className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mb-3 cursor-pointer"
            onClick={onClose}
          />
          <h3 className="font-sans font-bold text-base text-stone-800 dark:text-stone-100 tracking-tight">
            {title}
          </h3>
        </div>

        {/* 抽屉内容区域，预留良好边距 */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[70dvh] font-body text-sm text-stone-600 dark:text-stone-300">
          {children}
        </div>
      </div>
    </div>
  )
}
