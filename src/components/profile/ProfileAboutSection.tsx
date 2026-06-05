export default function ProfileAboutSection() {
  return (
    <section className="flex flex-col gap-4 mt-2">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
        关于 ScaleTrack
      </h3>
      <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
        <a
          href="https://github.com/bosens-China/ScaleTrack/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--carbon-surface-subtle)] no-underline"
        >
          <div className="flex items-center gap-4">
            <span className="i-lucide-message-square h-5 w-5 text-[var(--carbon-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--carbon-text)]">意见反馈</p>
              <p className="text-xs text-[var(--carbon-text-secondary)]">
                前往 GitHub 提交 Issue 或建议
              </p>
            </div>
          </div>
          <span className="i-lucide-external-link h-4 w-4 text-[var(--carbon-outline)]" />
        </a>
      </div>

      <div className="text-center pb-8 pt-4">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--carbon-text)] opacity-80">
          ScaleTrack
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)] mt-1">
          Stay on track
        </p>
      </div>
    </section>
  )
}
