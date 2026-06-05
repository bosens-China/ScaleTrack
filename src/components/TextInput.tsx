import type { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  rightElement?: ReactNode
  wrapperClassName?: string
}

export default function TextInput({
  rightElement,
  wrapperClassName = '',
  className = '',
  ...props
}: Props) {
  return (
    <div
      className={`relative border-b border-[var(--carbon-outline)] transition-colors focus-within:border-[var(--carbon-primary)] ${wrapperClassName}`}
    >
      <input
        {...props}
        className={`h-12 w-full border-none bg-[var(--carbon-surface-subtle)] px-4 text-sm text-[var(--carbon-text)] outline-none placeholder:text-[var(--carbon-text-secondary)] ${
          rightElement ? 'pr-11' : ''
        } ${className}`}
      />
      {rightElement && (
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--carbon-text-secondary)]">
          {rightElement}
        </div>
      )}
    </div>
  )
}
