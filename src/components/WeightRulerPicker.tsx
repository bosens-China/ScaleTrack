import { useEffect, useRef } from 'react'

import { useWeightUnit } from '@/hooks/weight-unit-context'
import { toDisplayWeight } from '@/utils/weight-unit'

const MARKER_WIDTH = 12

interface Props {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}

export default function WeightRulerPicker({
  value,
  // 与 validation.ts 的体重校验范围（20-300）对齐，避免极端体重无法录入或被强制 clamp
  min = 20,
  max = 300,
  step = 0.1,
  onChange,
}: Props) {
  // 刻度内部始终以 kg 计算（保证精度网格不变），仅刻度文案按单位换算
  const { unit } = useWeightUnit()
  const scrollRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)

  const markers = Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, index) =>
    Number((min + index * step).toFixed(1)),
  )

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const nextLeft = ((value - min) / step) * MARKER_WIDTH
    if (Math.abs(container.scrollLeft - nextLeft) < 1) return

    container.scrollLeft = nextLeft
  }, [min, step, value])

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return (
    <div className="relative h-40 overflow-hidden border-y border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)]">
      <div className="absolute left-1/2 top-0 z-10 h-full w-[2px] -translate-x-1/2 bg-[var(--carbon-primary)]" />
      <div
        ref={scrollRef}
        onScroll={event => {
          if (frameRef.current) cancelAnimationFrame(frameRef.current)

          const target = event.currentTarget
          frameRef.current = requestAnimationFrame(() => {
            if (!target) return
            const next = min + (target.scrollLeft / MARKER_WIDTH) * step
            onChange(Number(Math.min(max, Math.max(min, next)).toFixed(1)))
          })
        }}
        className="carbon-scrollbar h-full overflow-x-auto overflow-y-hidden px-[50%]"
      >
        <div className="flex h-full items-end">
          {markers.map(marker => {
            const isMajor = Number.isInteger(marker)
            const isHalf = Number.isInteger(marker * 2) && !isMajor

            return (
              <div
                key={marker}
                className="flex shrink-0 snap-center flex-col items-center"
                style={{ width: `${MARKER_WIDTH}px` }}
              >
                <div
                  className={
                    isMajor
                      ? 'h-16 w-px bg-[var(--carbon-text)]'
                      : isHalf
                        ? 'h-10 w-px bg-[var(--carbon-outline)]'
                        : 'h-6 w-px bg-[var(--carbon-border)]'
                  }
                />
                {isMajor ? (
                  <span className="mt-3 text-[11px] font-medium text-[var(--carbon-text-secondary)]">
                    {toDisplayWeight(marker, unit)}
                  </span>
                ) : (
                  <span className="mt-3 h-[16px]" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
