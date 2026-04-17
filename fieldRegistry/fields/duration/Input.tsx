import React, { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { DurationArray, FieldType } from "@/types"
import AppText from "@/components/AppText"
import FieldWrapper from "@/components/FieldWrapper"
import MultiWheelPickerModal from "@/components/MultiWheelPickerModal"
import { WheelPickerProps } from "@/components/WheelPicker"
import { InputProps } from "@/fieldRegistry/types"
import {
  TEMPORAL_UNIT_SHORT_LABELS,
  formatDurationValue,
  getDefaultDurationValue,
  getDurationPickerUnitBounds,
  getTemporalUnitsInRange,
  validateDurationValue,
} from "@/helpers/temporal"
import { colors, modalStyles, surfaceStyles } from "@/styles"

export const Input = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Duration>) => {
  const [value, setValue] = useState(initialValue)
  const [pickerVisible, setPickerVisible] = useState(false)
  const config = field.config
  const units = getTemporalUnitsInRange(config)
  const fallback = getDefaultDurationValue(config)
  const pickerValue = value ?? fallback
  const pickerConfigs: Omit<WheelPickerProps, "value" | "onChange">[] = []

  for (const unit of units) {
    const { min, max } = getDurationPickerUnitBounds(config, pickerValue, unit)

    pickerConfigs.push({
      min,
      max,
      label: TEMPORAL_UNIT_SHORT_LABELS[unit],
      showUndefined: false,
    })
  }

  const handlePickerSubmit = (newValues: (number | undefined)[]) => {
    const nextValue: DurationArray = newValues.map(component => component ?? 0)

    if (!validateDurationValue(config, nextValue)) {
      return
    }

    setValue(nextValue)
    onChange(nextValue)
    setPickerVisible(false)
  }

  const handleClear = () => {
    setValue(undefined)
    onChange(undefined)
    setPickerVisible(false)
  }

  const displayedValue = formatDurationValue(
    config,
    value,
    "Select duration",
  )

  const initialPickerValues = units.map(
    (_, index) => value?.[index] ?? fallback[index],
  )

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
