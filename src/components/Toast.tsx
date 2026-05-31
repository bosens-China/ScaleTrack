import { useEffect, useState } from 'react'
import { toast, type ToastMessage } from '../utils/toast'

// 全局 Toast 容器组件，统一切到 Carbon 风格提示。
export default function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  useEffect(() => {
    return toast.subscribe(setMessages)
  }, [])

  if (messages.length === 0) return null

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-full max-w-[320px] -translate-x-1/2 flex-col gap-2.5">
      {messages.map(msg => (
        <div
          key={msg.id}
          className="pointer-events-auto flex items-center gap-3 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 py-3 shadow-sm transition-all duration-300 animate-fade-in-up"
        >
          {msg.type === 'success' && (
            <span className="i-lucide-check-circle h-4 w-4 shrink-0 text-[#198038]" />
          )}
          {msg.type === 'error' && (
            <span className="i-lucide-alert-circle h-4 w-4 shrink-0 text-[#da1e28]" />
          )}
          {msg.type === 'info' && (
            <span className="i-lucide-info h-4 w-4 shrink-0 text-[var(--carbon-primary)]" />
          )}
          <span className="text-xs font-medium leading-relaxed text-[var(--carbon-text)]">
            {msg.text}
          </span>
        </div>
      ))}
    </div>
  )
}
