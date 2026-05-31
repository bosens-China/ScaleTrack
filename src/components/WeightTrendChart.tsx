import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type TooltipItem,
} from 'chart.js'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import type { WeightRecord } from '../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

interface Props {
  records: WeightRecord[]
}

export default function WeightTrendChart({ records }: Props) {
  const data = useMemo(
    () => ({
      labels: records.map(record => dayjs(record.date).format('dd').toUpperCase()),
      datasets: [
        {
          data: records.map(record => record.weight),
          borderColor: '#0f62fe',
          backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
            const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 240)
            gradient.addColorStop(0, 'rgba(15, 98, 254, 0.16)')
            gradient.addColorStop(1, 'rgba(15, 98, 254, 0)')
            return gradient
          },
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
          fill: true,
          tension: 0.32,
        },
      ],
    }),
    [records],
  )

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#161616',
          titleColor: '#ffffff',
          bodyColor: '#f4f4f4',
          cornerRadius: 0,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (items: { dataIndex: number }[]) => {
              const index = items[0]?.dataIndex
              if (index === undefined) return ''
              return dayjs(records[index]?.date).format('MM月DD日')
            },
            label: (item: TooltipItem<'line'>) => `${(item.parsed.y ?? 0).toFixed(1)} kg`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#6f6f6f',
            font: { family: 'IBM Plex Sans, sans-serif', size: 10 },
          },
          border: { color: '#e0e0e0' },
        },
        y: {
          grid: { color: 'rgba(141, 141, 141, 0.18)' },
          ticks: {
            color: '#6f6f6f',
            font: { family: 'IBM Plex Sans, sans-serif', size: 10 },
            callback: (value: string | number) => `${value}kg`,
          },
          border: { display: false },
        },
      },
      elements: {
        line: {
          capBezierPoints: false,
        },
      },
    }),
    [records],
  )

  if (records.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-6 text-center text-sm text-[var(--carbon-text-secondary)]">
        还没有足够的记录生成趋势图，先去“添加”页保存第一条体重数据吧。
      </div>
    )
  }

  return (
    <div className="h-60 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4">
      <Line data={data} options={options} />
    </div>
  )
}
