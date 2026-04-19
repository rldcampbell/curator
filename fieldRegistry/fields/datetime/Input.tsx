import React, { useEffect, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { DateTimeArray, FieldType } from "@/types"
import AppText from "@/components/AppText"
import FieldWrapper from "@/components/FieldWrapper"
import MultiWheelPickerModal, {
  NumericWheelPickerConfig,
} from "@/components/MultiWheelPickerModal"
import { InputProps } from "@/fieldRegistry/types"
import {
  TEMPORAL_UNIT_SHORT_LABELS,
  formatDateTimeValue,
  getDateTimeDayMax,
  getDateTimeUnitBounds,
  getDefaultDateTimeValue,
  getTemporalUnitsInRange,
  validateDateTimeValue,
} from "@/helpers/temporal"
import { colors, modalStyles, surfaceStyles } from "@/styles"

export const Input = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.DateTime>) => {
  const [value, setValue] = useState(initialValue)
  const [pickerVisible, setPickerVisible] = useState(false)
  const config = field.config
  const units = getTemporalUnitsInRange(config)
  const fallback = getDefaultDateTimeValue(config)
  const dayIndex = units.indexOf("day")

  useEffect(() => {
    if (value === undefined || dayIndex < 0) {
      return
    }

    const maxDay = getDateTimeDayMax(config, value)

    if (value[dayIndex] > maxDay) {
      const updated: DateTimeArray = [...value]
      updated[dayIndex] = maxDay
      setValue(updated)
    }
  }, [config, dayIndex, value])

  const pickerValue = value ?? fallback
  const pickerConfigs: NumericWheelPickerConfig[] = []

  for (const unit of units) {
    const { min, max } = getDateTimeUnitBounds(config, pickerValue, unit)

    pickerConfigs.push({
      min,
      max,
      label: TEMPORAL_UNIT_SHORT_LABELS[unit],
      showUndefined: false,
    })
  }

  const handlePickerSubmit = (newValues: (number | undefined)[]) => {
    const nextValue = newValues.map(
      (component, index) => component ?? fallback[index],
    )

    if (dayIndex >= 0) {
      const maxDay = getDateTimeDayMax(config, nextValue)

      if (nextValue[dayIndex] > maxDay) {
        nextValue[dayIndex] = maxDay
      }
    }

    if (!validateDateTimeValue(config, nextValue)) {
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

  const displayedValue = formatDateTimeValue(
    config,
    value,
    "Select date/time",
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
