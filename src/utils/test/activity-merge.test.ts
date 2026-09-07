import { expect, it } from 'vitest'

import type { ActivityRecord, ActivityType } from '@/types'
import { findActivityRecordConflict, getLatestActivityRecord } from '../activity'
import { mergeImport, type ImportPayload } from '../storage'

const empty = (): ImportPayload => ({
  profile: null,
  records: [],
  goals: [],
  activityRecords: [],
  activityTypes: [],
})
const type = (id: string, name = '攀岩'): ActivityType => ({
  id,
  name,
  icon: 'i-lucide-zap',
  color: '#c7f36b',
  isBuiltIn: false,
  createdAt: '2026-06-01T00:00:00.000Z',
})
const record = (id: string, activityTypeId: string, durationMinutes = 60): ActivityRecord => ({
  id,
  activityTypeId,
  activityName: '攀岩',
  activityIcon: 'i-lucide-zap',
  activityColor: '#c7f36b',
  date: '2026-06-14',
  durationMinutes,
  createdAt: '2026-06-14T00:00:00.000Z',
})

it('跨设备同名类型合并后能恢复最近时长并识别覆盖冲突', () => {
  const merged = mergeImport(
    { ...empty(), activityTypes: [type('device-a', 'Climbing')] },
    {
      ...empty(),
      activityTypes: [type('device-b', ' climbing ')],
      activityRecords: [record('r-b', 'device-b', 90)],
    },
  )
  expect(merged.activityTypes).toEqual([type('device-a', 'Climbing')])
  expect(getLatestActivityRecord(merged.activityRecords, ['device-a'])?.durationMinutes).toBe(90)
  expect(
    findActivityRecordConflict(merged.activityRecords, {
      date: '2026-06-14',
      activityTypeId: 'device-a',
    })?.id,
  ).toBe('r-b')
})

it('同日同类不同 ID 只保留更新记录，重复导入保持幂等', () => {
  const current = { ...empty(), activityRecords: [record('r-a', 'builtin-running')] }
  const incoming = {
    ...empty(),
    activityRecords: [
      { ...record('r-b', 'builtin-running', 90), updatedAt: '2026-06-15T00:00:00.000Z' },
    ],
  }
  const merged = mergeImport(current, incoming)
  expect(merged.activityRecords).toEqual(incoming.activityRecords)
  expect(mergeImport(merged, incoming)).toEqual(merged)
  expect(mergeImport(incoming, current).activityRecords).toEqual(incoming.activityRecords)
})

it('先统一同名类型，再消除跨设备同日重复记录', () => {
  const merged = mergeImport(
    { ...empty(), activityTypes: [type('a')], activityRecords: [record('r-a', 'a')] },
    {
      ...empty(),
      activityTypes: [type('b')],
      activityRecords: [{ ...record('r-b', 'b', 90), updatedAt: '2026-06-15T00:00:00.000Z' }],
    },
  )
  expect(merged.activityRecords).toMatchObject([
    { id: 'r-b', activityTypeId: 'a', durationMinutes: 90 },
  ])
  expect(merged.activityRecords).toHaveLength(1)
})

it('同 ID 修改日期先覆盖原记录，其他日期和类型保留', () => {
  const moved = {
    ...record('r-a', 'running', 90),
    date: '2026-06-15',
    updatedAt: '2026-06-15T00:00:00.000Z',
  }
  const merged = mergeImport(
    { ...empty(), activityRecords: [record('r-a', 'running'), record('r-b', 'swimming')] },
    { ...empty(), activityRecords: [moved] },
  )
  expect(merged.activityRecords).toEqual([record('r-b', 'swimming'), moved])
})

it('已删除类型的历史快照不按显示名称强行合并到新类型', () => {
  const historical = record('old', 'deleted-type')
  const merged = mergeImport(
    { ...empty(), activityTypes: [type('new-type')] },
    { ...empty(), activityRecords: [historical] },
  )
  expect(merged.activityRecords).toEqual([historical])
})

it('更新时间相同时保留当前记录', () => {
  const current = record('r-a', 'running', 60)
  const merged = mergeImport(
    { ...empty(), activityRecords: [current] },
    { ...empty(), activityRecords: [record('r-b', 'running', 90)] },
  )
  expect(merged.activityRecords).toEqual([current])
})
