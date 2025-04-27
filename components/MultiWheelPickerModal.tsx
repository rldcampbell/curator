import React, { useEffect, useState } from "react"
import { View } from "react-native"

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

  if (!visible) return null

  return (
    <CompactModalLayout
      title={title}
      contentStyle={{
        width: "100%",
        maxWidth: 400,
        alignSelf: "center",
        paddingHorizontal: 0,
      }}
      footer={
        <ModalButtonRow
          onApply={() => onSubmit(localValue)}
          onDiscard={onCancel}
          onClear={onClear}
        />
      }
    >
      <View style={{ paddingTop: 16, paddingBottom: 8 }}>
        <MultiWheelPicker
          pickers={pickerConfigs}
          value={localValue}
          onChange={setLocalValue}
        />
      </View>
    </CompactModalLayout>
  )
}
