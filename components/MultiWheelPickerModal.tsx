import React, { useEffect, useState } from "react"

import CompactModalLayout from "./CompactModalLayout"
import ModalButtonRow from "./ModalButtonRow"
import MultiWheelPicker from "./MultiWheelPicker"
import { WheelPickerProps } from "./WheelPicker"

type MultiWheelPickerModalProps = {
  visible: boolean
  title?: string
  initialValue: (number | undefined)[]
  pickerConfigs: Omit<WheelPickerProps, "value" | "onChange">[]
  onSubmit: (newValue: (number | undefined)[]) => void
  onCancel: () => void
  onClear?: () => void
}

export default function MultiWheelPickerModal({
  visible,
  title,
  initialValue,
  pickerConfigs,
  onSubmit,
  onCancel,
  onClear,
}: MultiWheelPickerModalProps) {
  const [localValue, setLocalValue] =
    useState<(number | undefined)[]>(initialValue)

  useEffect(() => {
    if (visible) {
      setLocalValue(initialValue)
    }
  }, [visible, initialValue])

  return (
    <CompactModalLayout
      visible={visible}
      onRequestClose={onCancel}
      title={title}
      footer={
        <ModalButtonRow
          onApply={() => onSubmit(localValue)}
          onDiscard={onCancel}
          onClear={onClear}
        />
      }
    >
      <MultiWheelPicker
        pickers={pickerConfigs}
        value={localValue}
        onChange={setLocalValue}
      />
    </CompactModalLayout>
  )
}
