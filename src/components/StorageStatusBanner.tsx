import { useEffect, useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import { getPersistenceStatus, retryPersistence, subscribePersistence } from '@/utils/storage'

/** 未落盘的数据始终可见，失败后允许重试；避免用户误以为已经安全保存。 */
export default function StorageStatusBanner() {
  const { t } = useI18n()
  const [status, setStatus] = useState(getPersistenceStatus)

  useEffect(() => {
    const update = () => setStatus(getPersistenceStatus())
    const unsubscribe = subscribePersistence(update)
    update()
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (getPersistenceStatus() === 'saved') return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      unsubscribe()
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [])

  if (status === 'saved') return null

  return (
    <div
      role={status === 'failed' ? 'alert' : 'status'}
      className="fixed left-4 right-4 z-[110] mx-auto max-w-md border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4 text-sm text-[var(--carbon-text)] shadow-lg"
      style={{ bottom: 'calc(var(--app-tabbar-height) + 16px)' }}
    >
      <p>
        {status === 'failed'
          ? t('保存失败，更改暂存于当前页面。关闭或刷新页面会丢失未保存的更改，请重试。')
          : t('正在保存，请稍候…')}
      </p>
      {status === 'failed' && (
        <button
          type="button"
          onClick={() => void retryPersistence()}
          className="mt-2 min-h-11 px-3 font-semibold text-[var(--carbon-primary)]"
        >
          {t('重试保存')}
        </button>
      )}
    </div>
  )
}
