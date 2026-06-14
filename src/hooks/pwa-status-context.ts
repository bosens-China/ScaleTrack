import { createContext } from 'react'

export interface PwaStatus {
  version: string
  isSupported: boolean
  isStandalone: boolean
  isChecking: boolean
  needRefresh: boolean
  offlineReady: boolean
  checkForUpdate: () => Promise<void>
  applyUpdate: (reloadPage?: boolean) => Promise<void>
  dismissUpdateNotice: () => void
}

export const PwaStatusContext = createContext<PwaStatus | null>(null)
