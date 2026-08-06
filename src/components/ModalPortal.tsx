import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  children: ReactNode
}

/**
 * 统一承载应用内弹窗：脱离页面层叠上下文，并在打开期间锁定背景滚动。
 * 这样日期选择器、确认框等不会被固定底栏遮挡。
 */
export default function ModalPortal({ children }: Props) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return createPortal(children, document.body)
}
