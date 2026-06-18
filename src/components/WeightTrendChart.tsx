import type { WeightRecord } from '@/types'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type Chart,
  type Plugin,
  type TooltipItem,
} from 'chart.js'
import dayjs from 'dayjs'
import { useSyncExternalStore } from 'react'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

// 订阅 <html> class 变化，用于响应深色模式切换
function subscribeDarkMode(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getIsDark() {
  return document.documentElement.classList.contains('dark')
}

interface Props {
  records: WeightRecord[]
  metric?: 'weight' | 'bmi'
  /** 目标体重；仅在体重指标下叠加一条目标参考线 */
  goalWeight?: number
}

export default function WeightTrendChart({ records, metric = 'weight', goalWeight }: Props) {
  const isDark = useSyncExternalStore(subscribeDarkMode, getIsDark)

  const primaryColor = isDark ? '#a8c7fa' : '#0f62fe'
  const primaryRgb = isDark ? '168, 199, 250' : '15, 98, 254'
  const tooltipBg = isDark ? '#333537' : '#161616'
  const tooltipTitle = isDark ? '#e3e3e3' : '#ffffff'
  const tooltipBody = isDark ? '#c4c7c5' : '#f4f4f4'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(141, 141, 141, 0.18)'
  const tickColor = isDark ? '#c4c7c5' : '#6f6f6f'
  const borderColor = isDark ? '#444746' : '#e0e0e0'
  const goalColor = isDark ? '#fbbf24' : '#f59e0b'

  // 目标线只在体重指标下展示，BMI 指标不叠加
  const showGoal = metric === 'weight' && typeof goalWeight === 'number'

  // 自定义插件：在目标体重处画一条虚线 + 文案标签
  const goalLinePlugin: Plugin<'line'> = {
    id: 'goalLine',
    afterDatasetsDraw(chart: Chart) {
      if (!showGoal || goalWeight === undefined) return
      const { ctx, chartArea, scales } = chart
      const y = scales.y.getPixelForValue(goalWeight)
      // 目标超出当前可视范围时不绘制，避免贴边误导
      if (y < chartArea.top || y > chartArea.bottom) return

      ctx.save()
      ctx.beginPath()
      ctx.setLineDash([5, 4])
      ctx.lineWidth = 1.5
      ctx.strokeStyle = goalColor
      ctx.moveTo(chartArea.left, y)
      ctx.lineTo(chartArea.right, y)
      ctx.stroke()

      const label = `目标 ${goalWeight.toFixed(1)}`
      ctx.setLineDash([])
      ctx.font = '10px IBM Plex Sans, sans-serif'
      ctx.textBaseline = 'bottom'
      ctx.textAlign = 'right'
      const padding = 4
      const textWidth = ctx.measureText(label).width
      ctx.fillStyle = goalColor
      ctx.fillRect(chartArea.right - textWidth - padding * 2, y - 16, textWidth + padding * 2, 14)
      ctx.fillStyle = isDark ? '#161616' : '#ffffff'
      ctx.fillText(label, chartArea.right - padding, y - 3)
      ctx.restore()
    },
  }

  const data = {
    labels: records.map(record => dayjs(record.date).format('MM/DD')),
    datasets: [
      {
        data: records.map(record => (metric === 'bmi' ? record.bmi : record.weight)),
        borderColor: primaryColor,
        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 240)
          gradient.addColorStop(0, `rgba(${primaryRgb}, 0.16)`)
          gradient.addColorStop(1, `rgba(${primaryRgb}, 0)`)
          return gradient
        },
        // 仅有一条记录时折线无法成形，显示一个可见的点避免图表空白
        pointRadius: records.length === 1 ? 4 : 0,
        pointHoverRadius: 4,
        borderWidth: 2,
        fill: true,
        tension: 0.32,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 20 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        cornerRadius: 0,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items: { dataIndex: number }[]) => {
            const index = items[0]?.dataIndex
            if (index === undefined) return ''
            return dayjs(records[index]?.date).format('MM月DD日')
          },
          label: (item: TooltipItem<'line'>) =>
            `${(item.parsed.y ?? 0).toFixed(1)}${metric === 'weight' ? ' kg' : ''}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: tickColor,
          font: { family: 'IBM Plex Sans, sans-serif', size: 10 },
          maxTicksLimit: 7,
          maxRotation: 0,
        },
        border: { color: borderColor },
      },
      y: {
        grace: '5%',
        // 目标体重纳入纵轴建议范围，保证目标线始终落在可视区内
        suggestedMin: showGoal ? goalWeight : undefined,
        suggestedMax: showGoal ? goalWeight : undefined,
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          font: { family: 'IBM Plex Sans, sans-serif', size: 10 },
          callback: (value: string | number) =>
            `${Number(Number(value).toFixed(1))}${metric === 'weight' ? 'kg' : ''}`,
        },
        border: { display: false },
      },
    },
    elements: {
      line: {
        capBezierPoints: false,
      },
    },
  }

  if (records.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center border border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-6 text-center text-sm text-[var(--carbon-text-secondary)]">
        还没有足够的记录生成趋势图，先去"添加"页保存第一条体重数据吧。
      </div>
    )
  }

  return (
    <div className="h-60 overflow-x-auto border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4 carbon-scrollbar">
      <div
        style={{ minWidth: records.length > 7 ? `${records.length * 40}px` : '100%' }}
        className="h-full"
      >
        <Line data={data} options={options} plugins={showGoal ? [goalLinePlugin] : []} />
      </div>
    </div>
  )
}
