import type { WeightRecord, WeightUnit } from '@/types'
import { movingAverage } from '@/utils/stats'
import { toDisplayWeight, WEIGHT_UNIT_LABEL } from '@/utils/weight-unit'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
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
  /** 体重展示单位（图表数据仍以 kg 计算，仅坐标/提示文案换算） */
  unit?: WeightUnit
  /** 是否叠加 7 日移动平均线，平滑日间水分波动（迷你图默认不显示） */
  showMovingAverage?: boolean
}

export default function WeightTrendChart({
  records,
  metric = 'weight',
  goalWeight,
  unit = 'kg',
  showMovingAverage = false,
}: Props) {
  const isDark = useSyncExternalStore(subscribeDarkMode, getIsDark)
  // 体重指标下的单位后缀（BMI 无单位）
  const weightUnitLabel = WEIGHT_UNIT_LABEL[unit]

  const primaryColor = isDark ? '#a8c7fa' : '#0f62fe'
  const primaryRgb = isDark ? '168, 199, 250' : '15, 98, 254'
  const tooltipBg = isDark ? '#333537' : '#161616'
  const tooltipTitle = isDark ? '#e3e3e3' : '#ffffff'
  const tooltipBody = isDark ? '#c4c7c5' : '#f4f4f4'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(141, 141, 141, 0.18)'
  const tickColor = isDark ? '#c4c7c5' : '#6f6f6f'
  const borderColor = isDark ? '#444746' : '#e0e0e0'
  const goalColor = isDark ? '#fbbf24' : '#f59e0b'
  // 均线用紫色，和主色蓝、目标线琥珀区分开
  const maColor = isDark ? '#be95ff' : '#8a3ffc'

  // 目标线只在体重指标下展示，BMI 指标不叠加
  const showGoal = metric === 'weight' && typeof goalWeight === 'number'

  // 数据点过少时均线意义不大，至少 4 个点才叠加
  const metricValues = records.map(record => (metric === 'bmi' ? record.bmi : record.weight))
  const showMA = showMovingAverage && records.length >= 4
  const maValues = showMA ? movingAverage(metricValues, 7) : []

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

      const label = `目标 ${toDisplayWeight(goalWeight, unit).toFixed(1)}`
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
        label: '实际',
        data: metricValues,
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
      // 7 日移动平均线：虚线、无填充，作为更稳的趋势参考
      ...(showMA
        ? [
            {
              label: '7日均线',
              data: maValues,
              borderColor: maColor,
              backgroundColor: 'transparent',
              pointRadius: 0,
              pointHoverRadius: 0,
              borderWidth: 2,
              borderDash: [4, 3],
              fill: false,
              tension: 0.32,
            },
          ]
        : []),
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
          label: (item: TooltipItem<'line'>) => {
            const raw = item.parsed.y ?? 0
            const value =
              metric === 'weight'
                ? `${toDisplayWeight(raw, unit).toFixed(1)} ${weightUnitLabel}`
                : raw.toFixed(1)
            // 有均线时区分两条线，避免提示里两个数字看不出谁是谁
            const label = item.dataset.label
            return showMA && label ? `${label}：${value}` : value
          },
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
            metric === 'weight'
              ? `${Number(toDisplayWeight(Number(value), unit).toFixed(1))}${weightUnitLabel}`
              : `${Number(Number(value).toFixed(1))}`,
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
    <div className="flex flex-col gap-2">
      {showMA && (
        <div className="flex items-center gap-4 px-1 text-[10px] text-[var(--carbon-text-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{ backgroundColor: primaryColor }} />
            实际
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed" style={{ borderColor: maColor }} />
            7日均线
          </span>
        </div>
      )}
      <div className="h-60 overflow-x-auto border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4 carbon-scrollbar">
        <div
          style={{ minWidth: records.length > 7 ? `${records.length * 40}px` : '100%' }}
          className="h-full"
        >
          <Line data={data} options={options} plugins={showGoal ? [goalLinePlugin] : []} />
        </div>
      </div>
    </div>
  )
}
