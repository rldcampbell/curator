import React, { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { DateTimeArray, FieldType, TEMPORAL_UNITS } from "@/types"
import AppText from "@/components/AppText"
import FieldWrapper from "@/components/FieldWrapper"
import MultiWheelPickerModal from "@/components/MultiWheelPickerModal"
import { WheelPickerProps } from "@/components/WheelPicker"
import { InputProps } from "@/fieldRegistry/types"
import { formatDurationArray } from "@/helpers/date"
import {
  TEMPORAL_UNIT_SHORT_LABELS,
  getTemporalIndicesInRange,
  temporalConfigToParts,
} from "@/helpers/temporal"
import { colors, modalStyles, surfaceStyles } from "@/styles"

const NATURAL_MAX = [999, 11, 31, 23, 59, 59, 999] as const

export const Input = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Duration>) => {
  const [value, setValue] = useState(initialValue)
  const [pickerVisible, setPickerVisible] = useState(false)
  const config = field.config
  const parts = temporalConfigToParts(config)
  const activeIndices = getTemporalIndicesInRange(config)
  const firstActiveIndex = activeIndices[0] ?? 0

  const pickerConfigs: Omit<WheelPickerProps, "value" | "onChange">[] = []

  for (const index of activeIndices) {
    const isTopUnit = index === firstActiveIndex
    const max = isTopUnit ? 999 : NATURAL_MAX[index]

    pickerConfigs.push({
      min: 0,
      max,
      label: TEMPORAL_UNIT_SHORT_LABELS[TEMPORAL_UNITS[index]],
      showUndefined: false,
    })
  }

  const handlePickerSubmit = (newValues: (number | undefined)[]) => {
    const fullArray: DateTimeArray = []
    for (const [cursor, index] of activeIndices.entries()) {
      fullArray[index] = newValues[cursor] ?? 0
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

  const displayedValue = formatDurationArray(value, parts)

  const initialPickerValues = activeIndices.map(index => value?.[index] ?? 0)

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
