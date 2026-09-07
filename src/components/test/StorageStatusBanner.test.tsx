/* @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { useAppState } from '@/hooks/useAppState'
import {
  flushPersistence,
  getPersistenceStatus,
  importData,
  retryPersistence,
  saveRecord,
} from '@/utils/storage'
import { cache, store } from '@/utils/storage/core'
import { toast } from '@/utils/toast'
import StorageStatusBanner from '../StorageStatusBanner'

const saved = new Map<string, unknown>()
const weightRecord = (weight: number) => ({
  id: 'r1',
  date: '2026-06-14',
  weight,
  bmi: 24.5,
  createdAt: '2026-06-14T00:00:00.000Z',
})

beforeEach(() => {
  saved.clear()
  cache.profile = {
    gender: 'male',
    height: 175,
    initialWeight: 80,
    createdAt: '2026-06-01T00:00:00.000Z',
  }
  cache.records = []
  cache.goals = []
  cache.activityRecords = []
  cache.customActivityTypes = []
  vi.spyOn(store, 'setItem').mockImplementation(async (key, value) => {
    saved.set(key, value)
    return value
  })
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(toast, 'success').mockImplementation(() => {})
})

afterEach(async () => {
  await act(async () => {
    await flushPersistence()
    vi.mocked(store.setItem).mockResolvedValue(null)
    await retryPersistence()
  })
  cleanup()
  vi.restoreAllMocks()
})

it('写入完成前不提示成功，完成后清除保存中状态', async () => {
  let finish!: () => void
  const waiting = new Promise<void>(resolve => {
    finish = resolve
  })
  vi.mocked(store.setItem).mockImplementation(async (_key, value) => {
    await waiting
    return value
  })
  render(<StorageStatusBanner />)
  const { result } = renderHook(() => useAppState())
  act(() => result.current.handleSaveRecord({ date: '2026-06-14', weight: 75 }))
  expect(screen.getByRole('status').textContent).toContain('正在保存')
  expect(toast.success).not.toHaveBeenCalled()
  await act(async () => {
    finish()
    await flushPersistence()
  })
  expect(toast.success).toHaveBeenCalledOnce()
  expect(screen.queryByRole('status')).toBeNull()
})

it('写入失败持续提示且不报成功，重试保存最新更改并解除离页提醒', async () => {
  vi.mocked(store.setItem).mockRejectedValue(new Error('QuotaExceededError'))
  render(<StorageStatusBanner />)
  const { result } = renderHook(() => useAppState())
  await act(async () => {
    result.current.handleSaveRecord({ date: '2026-06-14', weight: 75 })
    await flushPersistence()
  })
  expect(toast.success).not.toHaveBeenCalled()
  expect(screen.getByRole('alert').textContent).toContain('保存失败')
  const beforeUnload = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(beforeUnload)
  expect(beforeUnload.defaultPrevented).toBe(true)
  await act(async () => {
    saveRecord(weightRecord(74))
    await flushPersistence()
  })
  vi.mocked(store.setItem).mockImplementation(async (key, value) => {
    saved.set(key, value)
    return value
  })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '重试保存' }))
    await flushPersistence()
  })
  expect(saved.get('records')).toMatchObject([{ weight: 74 }])
  expect(screen.queryByRole('alert')).toBeNull()
  expect(getPersistenceStatus()).toBe('saved')
  const afterSave = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(afterSave)
  expect(afterSave.defaultPrevented).toBe(false)
})

it('旧写入完成不能清除更新写入的失败状态', async () => {
  vi.mocked(store.setItem)
    .mockResolvedValueOnce([])
    .mockRejectedValueOnce(new Error('QuotaExceededError'))
  saveRecord(weightRecord(75))
  saveRecord(weightRecord(74))
  expect(await flushPersistence()).toBe(false)
  expect(getPersistenceStatus()).toBe('failed')
  expect(await retryPersistence()).toBe(true)
  expect(saved.get('records')).toMatchObject([{ weight: 74 }])
})

it('导入部分写入失败后重试补齐数据，成功写入不会掩盖失败', async () => {
  vi.mocked(store.setItem).mockImplementation(async (key, value) => {
    if (key === 'records') throw new Error('QuotaExceededError')
    saved.set(key, value)
    return value
  })
  importData({
    version: 2,
    exportedAt: '2026-06-14T00:00:00.000Z',
    profile: cache.profile,
    records: [weightRecord(75)],
    goals: [],
    activityRecords: [],
    activityTypes: [],
  })
  expect(await flushPersistence()).toBe(false)
  expect(saved.has('records')).toBe(false)
  vi.mocked(store.setItem).mockImplementation(async (key, value) => {
    saved.set(key, value)
    return value
  })
  expect(await retryPersistence()).toBe(true)
  expect(saved.get('records')).toMatchObject([{ weight: 75 }])
  expect(saved.size).toBe(5)
})
