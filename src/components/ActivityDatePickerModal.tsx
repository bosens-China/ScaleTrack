import dayjs from 'dayjs'
import { useI18n } from 'virtual:ai-i18n'

import DatePickerModal from '@/components/DatePickerModal'

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  onSelectDate: (date: string) => void
}

/** 运动补录专用日历：允许选择任意历史日期。 */
export default function ActivityDatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}: Props) {
  const { t } = useI18n()
  const today = dayjs().format('YYYY-MM-DD')

  return (
    <DatePickerModal
      isOpen={isOpen}
      onClose={onClose}
      selectedDate={selectedDate}
      initialMonth={selectedDate}
      onSelectDate={onSelectDate}
      maxDate={today}
      dialogLabel={t('选择运动日期')}
      getDateAriaLabel={date => (date > today ? t`${date}，未来日期不可选择` : date)}
      footer={
        <p className="mt-4 text-center text-[11px] leading-5 text-[var(--carbon-text-secondary)]">
          {t('点击日期即可完成选择；不能记录未来的运动。')}
        </p>
      }
    />
  )
}
