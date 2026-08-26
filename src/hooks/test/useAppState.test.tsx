/* @vitest-environment jsdom */

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { saveProfile, saveRecord } from '@/utils/storage'
import { cache, store } from '@/utils/storage/core'
import { useAppState } from '../useAppState'

const TODAY = '2026-06-14'

function resetCache() {
  cache.profile = null
  cache.records = []
  cache.goals = []
  cache.activityRecords = []
  cache.customActivityTypes = []
  cache.lastBackupAt = null
}

describe('useAppState 关键记录流程', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(`${TODAY}T12:00:00.000Z`))
    resetCache()
    vi.spyOn(store, 'setItem').mockResolvedValue(undefined as never)
    saveProfile({
      gender: 'male',
      height: 175,
      initialWeight: 80,
      createdAt: '2026-06-01T08:00:00.000Z',
    })
    saveRecord({
      id: 'record-before-goal',
      date: '2026-06-13',
      weight: 80,
      bmi: 26.1,
      createdAt: '2026-06-13T08:00:00.000Z',
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
    resetCache()
  })

  it('记录达标后创建里程碑，删除该记录后恢复进行中目标', () => {
    const { result } = renderHook(() => useAppState())

    act(() => {
      result.current.handleSaveGoal(70)
    })
    act(() => {
      result.current.handleSaveRecord({ date: TODAY, weight: 69.8 })
    })

    const completedRecord = result.current.records.find(record => record.date === TODAY)
    expect(completedRecord?.bmi).toBe(22.8)
    expect(result.current.activeGoal).toBeNull()
    expect(result.current.achievedGoal).toMatchObject({ isCompleted: true, completedDate: TODAY })

    act(() => {
      result.current.handleDeleteRecord(completedRecord!.id)
    })

    expect(result.current.achievedGoal).toBeNull()
    expect(result.current.activeGoal).toMatchObject({ isCompleted: false, targetWeight: 70 })
    expect(result.current.milestones).toHaveLength(0)
  })
})
