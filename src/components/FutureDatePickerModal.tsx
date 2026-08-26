import dayjs from 'dayjs'
import { useI18n } from 'virtual:ai-i18n'

import DatePickerModal from '@/components/DatePickerModal'

interface Props {
  isOpen: boolean
  onClose: () => void
  /** 当前选中的日期（YYYY-MM-DD），未选则为空 */
  value?: string
  onSelect: (date: string) => void
  /** 可选范围下界，默认今天 */
  minDate?: string
  /** 可选范围上界，默认今天起两年后 */
  maxDate?: string
}

/** 未来目标日期选择器。 */
export default function FutureDatePickerModal({
  isOpen,
  onClose,
  value,
  onSelect,
  minDate,
  maxDate,
}: Props) {
  const { t } = useI18n()
  const today = dayjs().format('YYYY-MM-DD')
  const min = minDate ?? today
  const max = maxDate ?? dayjs().add(2, 'year').format('YYYY-MM-DD')

  return (
    <DatePickerModal
      isOpen={isOpen}
      onClose={onClose}
      selectedDate={value}
      initialMonth={value && value >= min ? value : min}
      onSelectDate={onSelect}
      minDate={min}
      maxDate={max}
      dialogLabel={t('选择目标日期')}
      footer={
        <p className="mt-4 text-center text-[11px] leading-5 text-[var(--carbon-text-secondary)]">
          {t('选择一个未来日期作为期望达成时间，可随时调整或清除。')}
        </p>
      }
    />
  )
}
