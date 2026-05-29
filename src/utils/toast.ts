export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  text: string
}

type Listener = (toasts: ToastMessage[]) => void
const listeners = new Set<Listener>()
let toasts: ToastMessage[] = []

// 全局 Toast 触发工具（中文注释）
export const toast = {
  // 订阅 Toast 变化
  subscribe(listener: Listener) {
    listeners.add(listener)
    listener(toasts)
    return () => {
      listeners.delete(listener)
    }
  },
  // 显示 Toast
  show(text: string, type: ToastType = 'success', duration = 2500) {
    const id = crypto.randomUUID()
    toasts = [...toasts, { id, type, text }]
    listeners.forEach(l => l(toasts))
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id)
      listeners.forEach(l => l(toasts))
    }, duration)
  },
  // 快捷成功提示
  success(text: string, duration?: number) {
    this.show(text, 'success', duration)
  },
  // 快捷错误提示
  error(text: string, duration?: number) {
    this.show(text, 'error', duration)
  },
  // 快捷信息提示
  info(text: string, duration?: number) {
    this.show(text, 'info', duration)
  },
}
