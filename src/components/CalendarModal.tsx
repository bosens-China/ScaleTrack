import dayjs from 'dayjs'
import { useI18n } from 'virtual:ai-i18n'

import DatePickerModal from '@/components/DatePickerModal'
import type { WeightRecord } from '@/types'
import { getEarliestRecordDate } from '@/utils/record-date'

interface Props {
  isOpen: boolean
  onClose: () => void
  records: WeightRecord[]
  selectedDate: string
  onSelectDate: (date: string) => void
}

/** 体重补录日历：在通用日期选择器上增加记录状态与近一个月限制。 */
export default function CalendarModal({
  isOpen,
  onClose,
  records,
  selectedDate,
  onSelectDate,
}: Props) {
  const { t } = useI18n()
  const today = dayjs().format('YYYY-MM-DD')
  const earliestDate = getEarliestRecordDate(today)
  const recordDates = new Set(records.map(record => record.date))

  return (
    <DatePickerModal
      isOpen={isOpen}
      onClose={onClose}
      selectedDate={selectedDate}
      initialMonth={selectedDate}
      onSelectDate={onSelectDate}
      minDate={earliestDate}
      maxDate={today}
      dialogLabel={t('选择记录日期')}
      getDateAriaLabel={date =>
        date > today
          ? t`${date}，未来日期不可选择`
          : date < earliestDate
            ? t`${date}，超出可补录范围`
            : date
      }
      dateIndicator={date => (
        <div className="absolute bottom-1.5 flex justify-center">
          <span
            className={`h-1 w-1 rounded-full ${
              recordDates.has(date) ? 'bg-[var(--carbon-primary)]' : 'bg-[var(--carbon-border)]'
            }`}
          />
        </div>
      )}
      footer={
        <>
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-[var(--carbon-text-secondary)]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--carbon-primary)]" />
              <span>{t('已记录')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--carbon-border)]" />
              <span>{t('未记录')}</span>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] leading-5 text-[var(--carbon-text-secondary)]">
            {t('仅支持补录最近 1 个月内的数据，今天仍可重复覆盖保存。')}
          </p>
        </>
      }
    />
  )
}
