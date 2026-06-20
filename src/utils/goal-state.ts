import type { Goal, WeightRecord } from '@/types'

function isGoalReached(goal: Goal, weight: number) {
  const isLossGoal = goal.startWeight > goal.targetWeight
  return isLossGoal ? weight <= goal.targetWeight : weight >= goal.targetWeight
}

function findLatestMutableGoalIndex(goals: Goal[]) {
  const activeGoalIndex = goals.findIndex(goal => !goal.isCompleted)
  if (activeGoalIndex >= 0) return activeGoalIndex
  return goals.length - 1
}

function findGoalCompletionDate(goal: Goal, records: WeightRecord[]) {
  return records
    .filter(record => record.date >= goal.startDate)
    .find(record => isGoalReached(goal, record.weight))?.date
}

export interface GoalReconcileResult {
  changed: boolean
  previousGoal: Goal | null
  nextGoal: Goal | null
  nextGoals: Goal[]
}

/**
 * 只重算最近一个可变目标的状态：
 * - 有进行中目标时，重算该目标是否已经达成
 * - 没有进行中目标时，重算最后一个里程碑是否仍然成立
 */
export function reconcileLatestGoalState(
  goals: Goal[],
  records: WeightRecord[],
): GoalReconcileResult {
  if (goals.length === 0) {
    return {
      changed: false,
      previousGoal: null,
      nextGoal: null,
      nextGoals: goals,
    }
  }

  const goalIndex = findLatestMutableGoalIndex(goals)
  const previousGoal = goals[goalIndex] ?? null

  if (!previousGoal) {
    return {
      changed: false,
      previousGoal: null,
      nextGoal: null,
      nextGoals: goals,
    }
  }

  const completionDate = findGoalCompletionDate(previousGoal, records)
  const nextGoal: Goal = completionDate
    ? {
        ...previousGoal,
        isCompleted: true,
        completedDate: completionDate,
      }
    : {
        ...previousGoal,
        isCompleted: false,
        completedDate: undefined,
      }

  const changed =
    previousGoal.isCompleted !== nextGoal.isCompleted ||
    previousGoal.completedDate !== nextGoal.completedDate

  if (!changed) {
    return {
      changed: false,
      previousGoal,
      nextGoal: previousGoal,
      nextGoals: goals,
    }
  }

  const nextGoals = goals.map((goal, index) => (index === goalIndex ? nextGoal : goal))

  return {
    changed: true,
    previousGoal,
    nextGoal,
    nextGoals,
  }
}

/**
 * 判断目标是否已过期：设置了期望达成日期、尚未完成、且该日期早于今天。
 */
export function isGoalOverdue(goal: Goal | null, today: string): boolean {
  if (!goal || goal.isCompleted || !goal.targetDate) return false
  return goal.targetDate < today
}

/**
 * 只有“今天这次提交”首次把目标推进到达成状态时，才弹庆祝动画。
 */
export function shouldCelebrateGoalCompletion(params: {
  previousGoal: Goal | null
  nextGoal: Goal | null
  recordDate: string
  today: string
}) {
  const { previousGoal, nextGoal, recordDate, today } = params
  if (!nextGoal) return false
  return !previousGoal?.isCompleted && nextGoal.isCompleted && recordDate === today
}
