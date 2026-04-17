import React, { useEffect, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { DateTimeArray, FieldType, TEMPORAL_UNITS } from "@/types"
import AppText from "@/components/AppText"
import FieldWrapper from "@/components/FieldWrapper"
import MultiWheelPickerModal from "@/components/MultiWheelPickerModal"
import { WheelPickerProps } from "@/components/WheelPicker"
import { InputProps } from "@/fieldRegistry/types"
import { formatDateTimeArray } from "@/helpers/date"
import {
  TEMPORAL_UNIT_SHORT_LABELS,
  getTemporalIndicesInRange,
  temporalConfigToParts,
} from "@/helpers/temporal"
import { colors, modalStyles, surfaceStyles } from "@/styles"

const MIN = [0, 1, 1, 0, 0, 0, 0] as const
const MAX = [9999, 12, 31, 23, 59, 59, 999] as const
const LEAP_YEAR = 2000

const getDaysInMonth = (
  year: number,
  month: number, // this month is 1 based!
) => new Date(year, month, 0).getDate() // month 0 based!

export const Input = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.DateTime>) => {
  const [value, setValue] = useState(initialValue)
  const [pickerVisible, setPickerVisible] = useState(false)
  const config = field.config
  const parts = temporalConfigToParts(config)
  const activeIndices = getTemporalIndicesInRange(config)

  const now = new Date()
  const fallback = [
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    12,
    0,
    0,
    0,
  ] as const

  // need to modify selected day in month if value too high based on new month
  useEffect(() => {
    const dayIndex = 2
    if (value !== undefined)
      if (activeIndices.includes(dayIndex) && (parts[1] || parts[0])) {
        const daysInMonth = getDaysInMonth(value[0] ?? LEAP_YEAR, value[1] ?? 1)
        if ((value[dayIndex] ?? 1) > daysInMonth) {
          const updated: DateTimeArray = [...value]
          updated[dayIndex] = daysInMonth
          setValue(updated)
        }
      }
  }, [value, parts])

  const pickerConfigs: Omit<WheelPickerProps, "value" | "onChange">[] = []

  for (const index of activeIndices) {
    let max: number = MAX[index]
    if (index === 2) {
      const year = value?.[0] ?? LEAP_YEAR
      const month = value?.[1] ?? 1
      max = new Date(year, month, 0).getDate()
    }

    pickerConfigs.push({
      min: MIN[index],
      max,
      label: TEMPORAL_UNIT_SHORT_LABELS[TEMPORAL_UNITS[index]],
      showUndefined: false,
    })
  }

  const handlePickerSubmit = (newValues: (number | undefined)[]) => {
    const fullArray: DateTimeArray = []
    for (const [cursor, index] of activeIndices.entries()) {
      fullArray[index] = newValues[cursor]
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

  const displayedValue = formatDateTimeArray(value, parts)

  const initialPickerValues = activeIndices.map(
    index => value?.[index] ?? fallback[index],
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
