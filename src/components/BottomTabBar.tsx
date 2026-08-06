import type { AppTab } from '@/types'
import { useI18n } from 'virtual:ai-i18n'

interface TabDefinition {
  key: AppTab
  label: string
  icon: string
}

interface Props {
  activeTab: AppTab
  onChange: (tab: AppTab) => void
}

export default function BottomTabBar({ activeTab, onChange }: Props) {
  const { t } = useI18n()
  const tabs: TabDefinition[] = [
    { key: 'dashboard', label: t('总览'), icon: 'i-lucide-layout-dashboard' },
    { key: 'trends', label: t('趋势'), icon: 'i-lucide-chart-line' },
    { key: 'add', label: t('添加'), icon: 'i-lucide-plus-circle' },
    { key: 'activity', label: t('运动'), icon: 'i-lucide-activity' },
    { key: 'profile', label: t('我的'), icon: 'i-lucide-user-round' },
  ]

  return (
    <nav className="app-tabbar fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 border-t border-[var(--carbon-border)] bg-[var(--tabbar-bg)] backdrop-blur-xl">
      {tabs.map(tab => {
        const isActive = tab.key === activeTab
        const isAdd = tab.key === 'add'

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 pb-1 pt-2 transition-colors duration-150 ${
              isActive ? 'text-[var(--carbon-primary)]' : 'text-[var(--carbon-text-secondary)]'
            }`}
          >
            <span
              className={`flex items-center justify-center ${
                isAdd
                  ? '-mt-5 h-11 w-11 rounded-full border-4 border-[var(--carbon-bg)] bg-[var(--sport-accent)] text-[var(--sport-accent-text)] shadow-lg'
                  : 'h-7 w-8'
              } ${isActive && !isAdd ? 'bg-[var(--carbon-primary-soft)]' : ''}`}
            >
              <span className={`${tab.icon} ${isAdd ? 'h-5 w-5' : 'h-[18px] w-[18px]'}`} />
            </span>
            <span
              className={`truncate text-[9px] font-bold ${isAdd ? '-mt-0.5' : ''} ${
                isActive ? 'opacity-100' : 'opacity-80'
              }`}
            >
              {tab.label}
            </span>
            {isActive && !isAdd && (
              <span className="absolute bottom-0 h-0.5 w-5 bg-[var(--carbon-primary)]" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
