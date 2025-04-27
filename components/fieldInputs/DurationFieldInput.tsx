import React from "react"
import { View } from "react-native"

import { DateTimeArray, FieldType } from "@/app/types"
import MultiWheelPicker from "@/components/MultiWheelPicker"
import { WheelPickerProps } from "@/components/WheelPicker"
import { InputProps } from "@/fieldRegistry/types"

const LABELS = ["Y", "M", "D", "h", "m", "s", "ms"] as const
const NATURAL_MAX = [999, 11, 31, 23, 59, 59, 999] as const

const DurationFieldInput = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Duration>) => {
  // TODO!!! handle state internally -it's 'initialValue' for a reason...
  const { parts } = field.config

  const firstActiveIndex = parts.findIndex(p => p)

  const pickerConfigs: Omit<WheelPickerProps, "value" | "onChange">[] = []
  const currentValues: (number | undefined)[] = []

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

      const value = initialValue?.[index]
      currentValues.push(value !== undefined ? value % (max + 1) : undefined)
    }
  }

  const handleChange = (newValues: (number | undefined)[]) => {
    const fullArray: (number | undefined)[] = []
    let cursor = 0

    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        fullArray.push(newValues[cursor])
        cursor++
      } else {
        fullArray.push(undefined)
      }
    }

    onChange(fullArray as DateTimeArray)
  }

  return (
    <View>
      <MultiWheelPicker
        pickers={pickerConfigs}
        value={currentValues}
        onChange={handleChange}
      />
    </View>
  )
}

export default DurationFieldInput
