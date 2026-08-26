/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import DatePickerModal from '../DatePickerModal'

describe('DatePickerModal', () => {
  afterEach(cleanup)

  it('只允许在给定范围内选择日期，并在选中后关闭弹窗', () => {
    const onClose = vi.fn()
    const onSelectDate = vi.fn()

    render(
      <DatePickerModal
        isOpen
        onClose={onClose}
        selectedDate="2026-06-14"
        initialMonth="2026-06-14"
        onSelectDate={onSelectDate}
        minDate="2026-06-10"
        maxDate="2026-06-20"
        dialogLabel="选择日期"
      />,
    )

    expect(screen.getByRole('button', { name: /2026-06-09/ })).toHaveProperty('disabled', true)

    fireEvent.click(screen.getByRole('button', { name: '2026-06-14' }))

    expect(onSelectDate).toHaveBeenCalledWith('2026-06-14')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
