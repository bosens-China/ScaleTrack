import { useContext } from 'react'

import { PwaStatusContext } from './pwa-status-context'

export function usePwaStatus() {
  const value = useContext(PwaStatusContext)
  if (!value) throw new Error('usePwaStatus must be used within PwaProvider')
  return value
}
