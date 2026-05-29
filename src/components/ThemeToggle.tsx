import { useEffect, useState } from 'react'
import { getTheme, toggleTheme } from '../utils/theme'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(getTheme() === 'dark')

  useEffect(() => {
    const handler = () => setIsDark(getTheme() === 'dark')
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const handleToggle = () => {
    toggleTheme()
    setIsDark(getTheme() === 'dark')
  }

  return (
    <button
      onClick={handleToggle}
      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--c-text-secondary)] hover:text-[var(--c-text)] hover:bg-[var(--c-bg-secondary)] transition-all duration-200 cursor-pointer"
      aria-label={isDark ? '切换为浅色模式' : '切换为深色模式'}
    >
      <span className={isDark ? 'i-lucide-moon' : 'i-lucide-sun'} />
    </button>
  )
}
