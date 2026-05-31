export default function AppHeader() {
  return (
    <header className="app-header fixed top-0 z-40 flex w-full max-w-[430px] items-center border-b border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4">
      <div className="flex items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--carbon-surface-subtle)] text-[var(--carbon-text-secondary)]">
          <span className="i-lucide-user-round h-4 w-4" />
        </div>
      </div>
    </header>
  )
}
