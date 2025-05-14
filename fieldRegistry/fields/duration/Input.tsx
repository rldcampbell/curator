import React, { useState } from "react"
import { Pressable, View } from "react-native"

import { DateTimeArray, FieldType } from "@/app/types"
import AppText from "@/components/AppText"
import FieldWrapper from "@/components/FieldWrapper"
import MultiWheelPickerModal from "@/components/MultiWheelPickerModal"
import { WheelPickerProps } from "@/components/WheelPicker"
import { InputProps } from "@/fieldRegistry/types"
import { formatDurationArray } from "@/helpers/date"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

const LABELS = ["Y", "M", "D", "h", "m", "s", "ms"] as const
const NATURAL_MAX = [999, 11, 31, 23, 59, 59, 999] as const

export const Input = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Duration>) => {
  const [value, setValue] = useState(initialValue)
  const [pickerVisible, setPickerVisible] = useState(false)
  const { parts } = field.config

  const firstActiveIndex = parts.findIndex(p => p)

  const pickerConfigs: Omit<WheelPickerProps, "value" | "onChange">[] = []

  for (const [index, enabled] of parts.entries()) {
    if (enabled) {
      const isTopUnit = index === firstActiveIndex
      const max = isTopUnit ? 999 : NATURAL_MAX[index]

      pickerConfigs.push({
        min: 0,
        max,
        label: LABELS[index],
        showUndefined: true,
      })
    }
  }

  const handlePickerSubmit = (newValues: (number | undefined)[]) => {
    const fullArray: DateTimeArray = []
    let cursor = 0

    for (const v of parts) {
      fullArray.push(v ? newValues[cursor++] : undefined)
    }

    setValue(fullArray)
    onChange(fullArray)
    setPickerVisible(false)
  }

  const handleClear = () => {
    setValue(undefined)
    onChange(undefined)
    setPickerVisible(false)
  }

  const displayedValue = formatDurationArray(value)

  const initialPickerValues = value ? value.filter((v, i) => parts[i]) : []

  return (
    <View>
      <FieldWrapper label={field.name}>
        <Pressable
          style={[
            sharedStyles.inputCard,
            modalStyles.buttonInModal,
            { justifyContent: "center" },
          ]}
          onPress={() => setPickerVisible(true)}
        >
          <AppText style={{ color: value ? "#000" : "#999" }}>
            {displayedValue}
          </AppText>
        </Pressable>
      </FieldWrapper>

      <MultiWheelPickerModal
        visible={pickerVisible}
        title={field.name}
        initialValue={initialPickerValues}
        pickerConfigs={pickerConfigs}
        onSubmit={handlePickerSubmit}
        onCancel={() => setPickerVisible(false)}
        onClear={handleClear}
      />
    </View>
  )
}
