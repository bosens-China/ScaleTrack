import { useRef } from 'react'
import { exportData, importData, type ExportData } from '../utils/storage'
import { toast } from '../utils/toast'

export default function DataImportExport() {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const data = exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scaletrack-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('数据导出成功！')
    } catch {
      toast.error('数据导出失败')
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ExportData
        importData(data)
        toast.success('数据导入成功，正在为您刷新...')
        setTimeout(() => {
          window.location.reload()
        }, 1200)
      } catch {
        toast.error('导入失败，JSON 文件格式不正确')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="card p-5 shadow-lg shadow-[var(--c-card-shadow)]">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
          <span className="i-lucide-database text-primary-600 text-sm" />
        </div>
        <h2 className="font-sans font-semibold text-stone-850 dark:text-stone-100 text-sm">
          数据管理
        </h2>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="btn-outline flex-1 flex items-center justify-center gap-2 text-xs py-3 min-h-[44px]"
        >
          <span className="i-lucide-download text-sm" />
          导出数据
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-outline flex-1 flex items-center justify-center gap-2 text-xs py-3 min-h-[44px]"
        >
          <span className="i-lucide-upload text-sm" />
          导入数据
        </button>
      </div>

      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
    </div>
  )
}
