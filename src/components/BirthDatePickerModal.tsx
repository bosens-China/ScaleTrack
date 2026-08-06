import { useEffect, useState } from 'react'
import { useI18n } from 'virtual:ai-i18n'

import BirthDatePicker from './BirthDatePicker'

interface Props {
  isOpen: boolean
  onClose: () => void
  value?: string
  onChange: (val: string) => void
}

export default function BirthDatePickerModal({ isOpen, onClose, value, onChange }: Props) {
  const { t } = useI18n()
  const [tempValue, setTempValue] = useState<string | undefined>(value)

  // Reset tempValue when modal opens
  useEffect(() => {
    if (isOpen) {
      // Use setTimeout to avoid synchronous setState warning
      const timer = setTimeout(() => setTempValue(value), 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen, value])

  if (!isOpen) return null

  const handleConfirm = () => {
    // If tempValue is undefined, the picker will have set a default via its internal effect,
    // but the state here might not be updated if no interactions happened.
    // However, the BirthDatePicker triggers onChange automatically on mount if value is undefined.
    onChange(tempValue!)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col rounded-t-2xl border-t border-[var(--carbon-border)] bg-[var(--carbon-surface)] p-4 shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-200 sm:mx-auto sm:max-w-[430px]">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-2 py-2 text-sm text-[var(--carbon-text-secondary)]"
          >
            {t('取消')}
          </button>
          <span className="text-sm font-medium text-[var(--carbon-text)]">{t('选择出生日期')}</span>
          <button
            onClick={handleConfirm}
            className="px-2 py-2 text-sm font-medium text-[var(--carbon-primary)]"
          >
            {t('确定')}
          </button>
        </div>
        <div className="px-2 pb-4">
          <BirthDatePicker value={tempValue} onChange={setTempValue} />
        </div>
      </div>
    </>
  )
}
