import dayjs from 'dayjs'
import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'

import {
  exportData,
  getActivityRecords,
  getLastBackupAt,
  getRecords,
  importData,
  recordBackup,
  validateImportData,
} from '@/utils/storage'
import { toast } from '@/utils/toast'

interface Props {
  onReload: () => void
}

// 距上次备份超过该天数视为「需要备份」
const BACKUP_STALE_DAYS = 14

interface PendingImport {
  data: unknown
  records: number
  activityRecords: number
  goals: number
  hasProfile: boolean
}

/** 导入导出单独收口，避免页面组件同时承担文件读写细节。 */
export default function ProfileDataSection({ onReload }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [lastBackup, setLastBackup] = useState<string | null>(() => getLastBackupAt())
  const [pending, setPending] = useState<PendingImport | null>(null)

  const hasData = getRecords().length > 0 || getActivityRecords().length > 0
  const daysSinceBackup = lastBackup ? dayjs().diff(dayjs(lastBackup), 'day') : null
  const backupStale =
    hasData && (lastBackup === null || (daysSinceBackup ?? 0) >= BACKUP_STALE_DAYS)

  const backupText =
    lastBackup === null
      ? '尚未备份过数据'
      : daysSinceBackup === 0
        ? '今天已备份'
        : `上次备份：${daysSinceBackup} 天前`

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
      recordBackup()
      setLastBackup(getLastBackupAt())
      toast.success('数据导出成功')
    } catch {
      toast.error('数据导出失败')
    }
  }

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        // 先校验结构，校验通过才弹出合并/覆盖选择
        const payload = validateImportData(data)
        setPending({
          data,
          records: payload.records.length,
          activityRecords: payload.activityRecords.length,
          goals: payload.goals.length,
          hasProfile: payload.profile !== null,
        })
      } catch (err) {
        toast.error(err instanceof Error ? `导入失败：${err.message}` : '导入失败，文件格式不正确')
      }
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  const handleConfirmImport = (mode: 'replace' | 'merge') => {
    if (!pending) return
    try {
      importData(pending.data, mode)
      toast.success(mode === 'merge' ? '已合并导入数据' : '已覆盖导入数据')
      onReload()
    } catch (err) {
      toast.error(err instanceof Error ? `导入失败：${err.message}` : '导入失败')
    } finally {
      setPending(null)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--carbon-text-secondary)]">
          本地数据
        </h3>
        {hasData && (
          <span
            className={`flex items-center gap-1 text-[11px] ${backupStale ? 'text-[var(--color-warning)]' : 'text-[var(--carbon-text-secondary)]'}`}
          >
            {backupStale && <span className="i-lucide-triangle-alert h-3 w-3" />}
            {backupText}
          </span>
        )}
      </div>

      {backupStale && (
        <div className="flex items-start gap-2 border-l-2 border-[var(--color-warning)] bg-[var(--carbon-surface-subtle)] px-3 py-2.5 text-xs leading-5 text-[var(--carbon-text)]">
          <span className="i-lucide-shield-alert mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
          <span>数据仅保存在本设备浏览器中，建议定期导出备份，避免清理缓存或更换设备时丢失。</span>
        </div>
      )}

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
                导出基础资料、体重、运动和目标数据
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
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* 导入确认：合并 / 覆盖二选一 */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="flex w-full max-w-sm flex-col gap-4 bg-[var(--carbon-surface)] p-5 shadow-lg">
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-semibold text-[var(--carbon-text)]">
                如何导入这份数据？
              </h4>
              <p className="text-xs leading-5 text-[var(--carbon-text-secondary)]">
                文件包含 {pending.records} 条体重、{pending.activityRecords} 条运动、
                {pending.goals} 个目标
                {pending.hasProfile ? '及基础资料' : ''}。
              </p>
            </div>

            <button
              onClick={() => handleConfirmImport('merge')}
              className="flex flex-col gap-1 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-3 text-left transition-colors hover:border-[var(--carbon-primary)] hover:bg-[var(--carbon-surface-subtle)]"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--carbon-text)]">
                <span className="i-lucide-git-merge h-4 w-4 text-[var(--carbon-primary)]" />
                合并导入（推荐）
              </span>
              <span className="text-xs leading-5 text-[var(--carbon-text-secondary)]">
                与现有数据合并，按日期去重，保留更新的记录。适合多设备同步。
              </span>
            </button>

            <button
              onClick={() => handleConfirmImport('replace')}
              className="flex flex-col gap-1 border border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-3 text-left transition-colors hover:border-[var(--color-danger)] hover:bg-[var(--carbon-surface-subtle)]"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--carbon-text)]">
                <span className="i-lucide-replace h-4 w-4 text-[var(--color-danger)]" />
                覆盖导入
              </span>
              <span className="text-xs leading-5 text-[var(--carbon-text-secondary)]">
                清空当前所有本地数据，完全替换为文件内容。
              </span>
            </button>

            <button
              onClick={() => setPending(null)}
              className="h-10 text-sm text-[var(--carbon-text-secondary)] transition-colors hover:text-[var(--carbon-text)]"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
