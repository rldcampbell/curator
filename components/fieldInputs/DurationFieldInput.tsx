import React, { useState } from "react"
import { Pressable, View } from "react-native"

import { DateTimeArray, FieldType } from "@/app/types"
import { WheelPickerProps } from "@/components/WheelPicker"
import { InputProps } from "@/fieldRegistry/types"
import { formatDurationArray } from "@/helpers/date"

import AppText from "../AppText"
import MultiWheelPickerModal from "../MultiWheelPickerModal"

const LABELS = ["Y", "M", "D", "h", "m", "s", "ms"] as const
const NATURAL_MAX = [999, 11, 31, 23, 59, 59, 999] as const

const DurationFieldInput = ({
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

    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        fullArray.push(newValues[cursor])
        cursor++
      } else {
        fullArray.push(undefined)
      }
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
      <Pressable onPress={() => setPickerVisible(true)}>
        <AppText>{displayedValue}</AppText>
      </Pressable>

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

export default DurationFieldInput
