/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { WeightUnitContext } from '@/hooks/weight-unit-context'
import type { WeightUnit } from '@/types'
import ProfileGoalSection from '../profile/ProfileGoalSection'

afterEach(cleanup)

it.each([
  ['kg', 'jin', '70', '140.0'],
  ['jin', 'kg', '140', '70.0'],
] as const)('编辑目标时从 %s 切换到 %s 保留草稿实际体重', (from, to, input, display) => {
  const onSaveGoal = vi.fn()
  const view = (unit: WeightUnit) => (
    <WeightUnitContext.Provider value={{ unit, setUnit: vi.fn() }}>
      <ProfileGoalSection
        goal={null}
        currentWeight={80}
        recommendedWeight={65}
        onSaveGoal={onSaveGoal}
        onAbandonGoal={vi.fn()}
      />
    </WeightUnitContext.Provider>
  )
  const { rerender } = render(view(from))
  fireEvent.click(screen.getByRole('button', { name: '设置' }))
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: input } })
  rerender(view(to))
  expect(screen.getByRole('spinbutton')).toHaveProperty('value', display)
  fireEvent.click(screen.getByRole('button', { name: '保存' }))
  expect(onSaveGoal).toHaveBeenCalledWith(70, undefined)
})

it('切换单位后继续修改草稿，再切回原单位仍保持实际体重', () => {
  const onSaveGoal = vi.fn()
  const view = (unit: WeightUnit) => (
    <WeightUnitContext.Provider value={{ unit, setUnit: vi.fn() }}>
      <ProfileGoalSection
        goal={null}
        currentWeight={80}
        recommendedWeight={70}
        onSaveGoal={onSaveGoal}
        onAbandonGoal={vi.fn()}
      />
    </WeightUnitContext.Provider>
  )
  const { rerender } = render(view('kg'))
  fireEvent.click(screen.getByRole('button', { name: '设置' }))
  rerender(view('jin'))
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '130' } })
  rerender(view('kg'))
  fireEvent.click(screen.getByRole('button', { name: '保存' }))
  expect(onSaveGoal).toHaveBeenCalledWith(65, undefined)
})
