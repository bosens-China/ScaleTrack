import { useEffect, useState } from 'react'
import { toast, type ToastMessage } from '../utils/toast'

// 全局 Toast 容器组件，放在 App.tsx 根部（中文注释）
export default function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  useEffect(() => {
    return toast.subscribe(setMessages)
  }, [])

  if (messages.length === 0) return null

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2.5 w-full max-w-[320px] pointer-events-none">
      {messages.map(msg => (
        <div
          key={msg.id}
          className="animate-fade-in-up flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 dark:border-black/20 bg-white/75 dark:bg-stone-900/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 pointer-events-auto transition-all duration-300"
        >
          {msg.type === 'success' && (
            <span className="i-lucide-check-circle text-emerald-500 text-base shrink-0" />
          )}
          {msg.type === 'error' && (
            <span className="i-lucide-alert-circle text-rose-500 text-base shrink-0" />
          )}
          {msg.type === 'info' && (
            <span className="i-lucide-info text-blue-500 text-base shrink-0" />
          )}
          <span className="text-xs font-body font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
            {msg.text}
          </span>
        </div>
      ))}
    </div>
  )
}
