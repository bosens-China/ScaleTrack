import { describe, expect, it } from 'vitest'

import type { Goal, WeightRecord } from '@/types'

import { reconcileLatestGoalState, shouldCelebrateGoalCompletion } from '../goal-state'

describe('goal-state', () => {
  it('should complete the active goal when a record reaches the target', () => {
    const goals: Goal[] = [
      {
        id: 'goal-1',
        targetWeight: 70,
        startWeight: 75,
        startDate: '2026-06-10',
        isCompleted: false,
      },
    ]
    const records: WeightRecord[] = [
      {
        id: 'record-1',
        date: '2026-06-12',
        weight: 72,
        bmi: 22,
        createdAt: '2026-06-12T08:00:00.000Z',
      },
      {
        id: 'record-2',
        date: '2026-06-14',
        weight: 69.9,
        bmi: 21.9,
        createdAt: '2026-06-14T08:00:00.000Z',
      },
    ]

    const result = reconcileLatestGoalState(goals, records)

    expect(result.changed).toBe(true)
    expect(result.nextGoal).toMatchObject({
      id: 'goal-1',
      isCompleted: true,
      completedDate: '2026-06-14',
    })
  })

  it('should reopen the latest completed goal when records no longer support it', () => {
    const goals: Goal[] = [
      {
        id: 'goal-1',
        targetWeight: 70,
        startWeight: 75,
        startDate: '2026-06-10',
        completedDate: '2026-06-14',
        isCompleted: true,
      },
    ]
    const records: WeightRecord[] = [
      {
        id: 'record-1',
        date: '2026-06-12',
        weight: 72,
        bmi: 22,
        createdAt: '2026-06-12T08:00:00.000Z',
      },
      {
        id: 'record-2',
        date: '2026-06-14',
        weight: 70.4,
        bmi: 22.1,
        createdAt: '2026-06-14T08:00:00.000Z',
      },
    ]

    const result = reconcileLatestGoalState(goals, records)

    expect(result.changed).toBe(true)
    expect(result.nextGoal).toMatchObject({
      id: 'goal-1',
      isCompleted: false,
    })
    expect(result.nextGoal?.completedDate).toBeUndefined()
  })

  it('should only reconcile the latest mutable goal and keep older milestones unchanged', () => {
    const goals: Goal[] = [
      {
        id: 'goal-1',
        targetWeight: 70,
        startWeight: 75,
        startDate: '2026-06-01',
        completedDate: '2026-06-08',
        isCompleted: true,
      },
      {
        id: 'goal-2',
        targetWeight: 68,
        startWeight: 70,
        startDate: '2026-06-09',
        isCompleted: false,
      },
    ]
    const records: WeightRecord[] = [
      {
        id: 'record-1',
        date: '2026-06-08',
        weight: 70,
        bmi: 22,
        createdAt: '2026-06-08T08:00:00.000Z',
      },
      {
        id: 'record-2',
        date: '2026-06-14',
        weight: 68.5,
        bmi: 21.8,
        createdAt: '2026-06-14T08:00:00.000Z',
      },
    ]

    const result = reconcileLatestGoalState(goals, records)

    expect(result.nextGoals[0]).toEqual(goals[0])
    expect(result.nextGoal?.id).toBe('goal-2')
    expect(result.nextGoal?.isCompleted).toBe(false)
  })

  it('should only celebrate when today record causes the first completion', () => {
    const previousGoal: Goal = {
      id: 'goal-1',
      targetWeight: 70,
      startWeight: 75,
      startDate: '2026-06-10',
      isCompleted: false,
    }
    const nextGoal: Goal = {
      ...previousGoal,
      isCompleted: true,
      completedDate: '2026-06-14',
    }

    expect(
      shouldCelebrateGoalCompletion({
        previousGoal,
        nextGoal,
        recordDate: '2026-06-14',
        today: '2026-06-14',
      }),
    ).toBe(true)

    expect(
      shouldCelebrateGoalCompletion({
        previousGoal,
        nextGoal,
        recordDate: '2026-06-13',
        today: '2026-06-14',
      }),
    ).toBe(false)

    expect(
      shouldCelebrateGoalCompletion({
        previousGoal: nextGoal,
        nextGoal,
        recordDate: '2026-06-14',
        today: '2026-06-14',
      }),
    ).toBe(false)
  })
})
