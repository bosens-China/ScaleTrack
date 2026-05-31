import type { ChangeEvent } from 'react'
import { useRef } from 'react'

import { exportData, importData } from '../../utils/storage'
import { toast } from '../../utils/toast'

interface Props {
  onReload: () => void
}

/** 导入导出单独收口，避免页面组件同时承担文件读写细节。 */
export default function ProfileDataSection({ onReload }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const data = exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `scaletrack-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('数据导出成功')
    } catch {
      toast.error('数据导出失败')
    }
  }

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        importData(JSON.parse(reader.result as string))
        toast.success('数据导入成功')
        onReload()
      } catch {
        toast.error('导入失败，JSON 文件格式不正确')
      }
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <section className="flex flex-col gap-4">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
        本地数据
      </h3>
      <div className="border border-[var(--carbon-border)] bg-[var(--carbon-surface)]">
        <button
          onClick={handleExport}
          className="flex w-full items-center justify-between border-b border-[var(--carbon-border)] p-4 text-left transition-colors hover:bg-[var(--carbon-surface-subtle)]"
        >
          <div className="flex items-center gap-4">
            <span className="i-lucide-download h-5 w-5 text-[var(--carbon-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--carbon-text)]">导出数据</p>
              <p className="text-xs text-[var(--carbon-text-secondary)]">
                导出基础资料、体重记录和目标数据
              </p>
            </div>
          </div>
          <span className="i-lucide-chevron-right h-5 w-5 text-[var(--carbon-outline)]" />
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--carbon-surface-subtle)]"
        >
          <div className="flex items-center gap-4">
            <span className="i-lucide-upload h-5 w-5 text-[var(--carbon-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--carbon-text)]">导入数据</p>
              <p className="text-xs text-[var(--carbon-text-secondary)]">
                从 JSON 文件恢复本地记录
              </p>
            </div>
          </div>
          <span className="i-lucide-chevron-right h-5 w-5 text-[var(--carbon-outline)]" />
        </button>
      </div>
      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
    </section>
  )
}
