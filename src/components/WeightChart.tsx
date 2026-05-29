import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import type { TimeRange, WeightRecord } from '../types'
import { getBMIColor } from '../utils/bmi'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const RANGE_OPTIONS: { key: TimeRange; label: string }[] = [
  { key: '3d', label: '3天' },
  { key: '7d', label: '7天' },
  { key: '1m', label: '1月' },
  { key: '3m', label: '3月' },
]

function filterByRange(records: WeightRecord[], range: TimeRange): WeightRecord[] {
  const now = dayjs()
  const cutoff = {
    '3d': now.subtract(3, 'day'),
    '7d': now.subtract(7, 'day'),
    '1m': now.subtract(1, 'month'),
    '3m': now.subtract(3, 'month'),
  }[range]

  return records.filter(r => dayjs(r.date).isAfter(cutoff) || dayjs(r.date).isSame(cutoff, 'day'))
}

interface Props {
  records: WeightRecord[]
}

export default function WeightChart({ records }: Props) {
  const [range, setRange] = useState<TimeRange>('7d')
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const filtered = useMemo(() => filterByRange(records, range), [records, range])

  const data = useMemo(
    () => ({
      labels: filtered.map(r => dayjs(r.date).format('MM/DD')),
      datasets: [
        {
          label: '体重 (kg)',
          data: filtered.map(r => r.weight),
          borderColor: '#14b8a6',
          backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D } }) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260)
            gradient.addColorStop(0, 'rgba(20, 184, 166, 0.15)')
            gradient.addColorStop(1, 'rgba(20, 184, 166, 0)')
            return gradient
          },
          pointBackgroundColor: filtered.map(r => getBMIColor(r.bmi)),
          pointBorderColor: filtered.map(r => getBMIColor(r.bmi)),
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBorderWidth: 3,
          pointHoverBorderColor: isDark ? '#1c1917' : '#ffffff',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'BMI',
          data: filtered.map(r => r.bmi),
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          pointBackgroundColor: filtered.map(r => getBMIColor(r.bmi)),
          pointBorderColor: filtered.map(r => getBMIColor(r.bmi)),
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBorderWidth: 3,
          pointHoverBorderColor: isDark ? '#1c1917' : '#ffffff',
          borderWidth: 2,
          borderDash: [6, 4],
          fill: false,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    }),
    [filtered, isDark],
  )

  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const textColor = isDark ? '#a8a29e' : '#78716c'

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'end' as const,
          labels: {
            color: textColor,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { size: 11, family: "'DM Sans', sans-serif", weight: 500 as const },
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#292524' : '#ffffff',
          titleColor: isDark ? '#fafaf9' : '#1c1917',
          bodyColor: isDark ? '#d6d3d1' : '#57534e',
          borderColor: isDark ? '#44403c' : '#e7e5e4',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 16,
          titleFont: { weight: 600 as const, family: "'Plus Jakarta Sans', sans-serif" },
          bodyFont: { family: "'DM Sans', sans-serif" },
          callbacks: {
            afterBody: (items: { dataIndex: number }[]) => {
              const idx = items[0]?.dataIndex
              if (idx !== undefined && filtered[idx]) {
                return `记录日期: ${filtered[idx].date}`
              }
              return ''
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 11, family: "'DM Sans', sans-serif" } },
          border: { display: false },
        },
        y: {
          type: 'linear' as const,
          position: 'left' as const,
          title: {
            display: true,
            text: '体重 (kg)',
            color: textColor,
            font: { size: 11, family: "'DM Sans', sans-serif" },
          },
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 11, family: "'DM Sans', sans-serif" } },
          border: { display: false },
        },
        y1: {
          type: 'linear' as const,
          position: 'right' as const,
          title: {
            display: true,
            text: 'BMI',
            color: textColor,
            font: { size: 11, family: "'DM Sans', sans-serif" },
          },
          grid: { drawOnChartArea: false },
          ticks: { color: textColor, font: { size: 11, family: "'DM Sans', sans-serif" } },
          border: { display: false },
        },
      },
    }),
    [isDark, gridColor, textColor, filtered],
  )

  if (records.length === 0) {
    return (
      <div className="card p-8 text-center shadow-lg shadow-[var(--c-card-shadow)]">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[var(--c-bg-secondary)] flex items-center justify-center">
          <span className="i-lucide-chart-line text-[var(--c-text-secondary)]/40 w-5 h-5" />
        </div>
        <p className="text-sm text-[var(--c-text-secondary)]">还没有记录，添加第一条体重数据吧</p>
      </div>
    )
  }

  return (
    <div className="card p-5 shadow-lg shadow-[var(--c-card-shadow)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <span className="i-lucide-chart-line text-primary-600 w-4 h-4" />
          </div>
          <h2 className="font-sans font-semibold text-[var(--c-text)]">变化趋势</h2>
        </div>
        <div className="flex bg-[var(--c-bg-secondary)] rounded-xl p-1">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 cursor-pointer font-medium ${
                range === opt.key
                  ? 'bg-[var(--c-card)] text-primary-600 shadow-sm'
                  : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[260px]">
        <Line data={data} options={options} />
      </div>

      {/* Data point color legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-[var(--c-text-secondary)]">
        {[
          { color: '#06b6d4', label: '偏瘦' },
          { color: '#10b981', label: '正常' },
          { color: '#f59e0b', label: '偏胖' },
          { color: '#f43f5e', label: '肥胖' },
        ].map(item => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
