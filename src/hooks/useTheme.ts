import { useSyncExternalStore } from 'react'

export type ThemeType = 'light' | 'dark' | 'auto'

function getThemeSnapshot(): ThemeType {
  return (localStorage.getItem('scaletrack_theme') as ThemeType) || 'auto'
}

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'scaletrack_theme') callback()
  }
  window.addEventListener('storage', handleStorage)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', handleStorage)
  }
}

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export function setTheme(theme: ThemeType) {
  localStorage.setItem('scaletrack_theme', theme)
  applyThemeDOM(theme)
  emitChange()
}

export function applyThemeDOM(theme: ThemeType) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

// Global listener for OS theme change
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemeSnapshot() === 'auto') {
      applyThemeDOM('auto')
    }
  })
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot)
  return { theme, setTheme }
}
