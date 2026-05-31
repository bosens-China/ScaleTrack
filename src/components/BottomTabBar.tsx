import type { AppTab } from '../types'

interface TabDefinition {
  key: AppTab
  label: string
  icon: string
}

const TABS: TabDefinition[] = [
  { key: 'dashboard', label: '仪表盘', icon: 'i-lucide-layout-dashboard' },
  { key: 'trends', label: '趋势', icon: 'i-lucide-chart-line' },
  { key: 'add', label: '添加', icon: 'i-lucide-plus-circle' },
  { key: 'profile', label: '个人中心', icon: 'i-lucide-user-round' },
]

interface Props {
  activeTab: AppTab
  onChange: (tab: AppTab) => void
}

export default function BottomTabBar({ activeTab, onChange }: Props) {
  return (
    <nav className="app-tabbar fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 border-t border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
      {TABS.map(tab => {
        const isActive = tab.key === activeTab

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 border-t-2 pb-1 pt-2 transition-colors duration-150 ${
              isActive
                ? 'border-[var(--carbon-primary)] bg-[var(--carbon-primary-soft)] text-[var(--carbon-primary)]'
                : 'border-transparent text-[var(--carbon-text-secondary)] hover:bg-[var(--carbon-surface-variant)]'
            }`}
          >
            <span className={`${tab.icon} h-5 w-5 ${isActive ? 'opacity-100' : 'opacity-80'}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
