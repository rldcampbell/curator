import React, { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { DateTimeArray, FieldType } from "@/types"
import AppText from "@/components/AppText"
import FieldWrapper from "@/components/FieldWrapper"
import MultiWheelPickerModal from "@/components/MultiWheelPickerModal"
import { WheelPickerProps } from "@/components/WheelPicker"
import { InputProps } from "@/fieldRegistry/types"
import { formatDurationArray } from "@/helpers/date"
import { colors, modalStyles, surfaceStyles } from "@/styles"

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
          style={[surfaceStyles.inputCard, modalStyles.buttonInModal, styles.button]}
          onPress={() => setPickerVisible(true)}
        >
          <AppText style={value ? styles.valueText : styles.placeholderText}>
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

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
  },
  valueText: {
    color: "#000",
  },
  placeholderText: {
    color: colors.textPlaceholder,
  },
})
