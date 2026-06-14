import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

import { PwaStatusContext, type PwaStatus } from '@/hooks/pwa-status-context'
import { toast } from '@/utils/toast'

function getIsStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && navigator.standalone === true)
  )
}

export default function PwaProvider({ children }: { children: ReactNode }) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>()
  const [isChecking, setIsChecking] = useState(false)
  const [isStandalone] = useState(getIsStandalone)
  const isSupported = 'serviceWorker' in navigator

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_, swRegistration) {
      setRegistration(swRegistration)
    },
    onOfflineReady() {
      toast.success('ScaleTrack 已可离线使用')
    },
    onNeedRefresh() {
      toast.info('发现新版本，可前往个人页更新')
    },
    onRegisterError() {
      toast.error('离线能力注册失败，请刷新后重试')
    },
  })

  const checkForUpdate = useCallback(async () => {
    if (!isSupported || !registration) {
      toast.info('当前环境暂不支持检查更新')
      return
    }

    setIsChecking(true)
    try {
      await registration.update()
      toast.info('已检查更新，若有新版本会自动提示')
    } catch {
      toast.error('检查更新失败，请稍后重试')
    } finally {
      setIsChecking(false)
    }
  }, [isSupported, registration])

  const dismissUpdateNotice = useCallback(() => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }, [setOfflineReady, setNeedRefresh])

  const value = useMemo<PwaStatus>(
    () => ({
      version: __APP_VERSION__,
      isSupported,
      isStandalone,
      isChecking,
      needRefresh,
      offlineReady,
      checkForUpdate,
      applyUpdate: updateServiceWorker,
      dismissUpdateNotice,
    }),
    [
      isSupported,
      isStandalone,
      isChecking,
      needRefresh,
      offlineReady,
      checkForUpdate,
      updateServiceWorker,
      dismissUpdateNotice,
    ],
  )

  return <PwaStatusContext.Provider value={value}>{children}</PwaStatusContext.Provider>
}
