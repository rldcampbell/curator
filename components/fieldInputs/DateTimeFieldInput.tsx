import React, { useEffect, useState } from "react"
import { Pressable, View } from "react-native"

import { DateTimeArray, FieldType } from "@/app/types"
import { WheelPickerProps } from "@/components/WheelPicker"
import { InputProps } from "@/fieldRegistry/types"
import { formatDateTimeArray } from "@/helpers/date"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import AppText from "../AppText"
import FieldWrapper from "../FieldWrapper"
import MultiWheelPickerModal from "../MultiWheelPickerModal"

const LABELS = ["Y", "M", "D", "h", "m", "s", "ms"] as const
const MIN = [0, 1, 1, 0, 0, 0, 0] as const
const MAX = [9999, 12, 31, 23, 59, 59, 999] as const
const LEAP_YEAR = 2000

const getDaysInMonth = (
  year: number,
  month: number, // this month is 1 based!
) => new Date(year, month, 0).getDate() // month 0 based!

const DateTimeFieldInput = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.DateTime>) => {
  const [value, setValue] = useState(initialValue)
  const [pickerVisible, setPickerVisible] = useState(false)
  const { parts } = field.config

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
      if (parts[dayIndex] && (parts[1] || parts[0])) {
        const daysInMonth = getDaysInMonth(value[0] ?? LEAP_YEAR, value[1] ?? 1)
        if ((value[dayIndex] ?? 1) > daysInMonth) {
          const updated: DateTimeArray = [...value]
          updated[dayIndex] = daysInMonth
          setValue(updated)
        }
      }
  }, [value, parts])

  const pickerConfigs: Omit<WheelPickerProps, "value" | "onChange">[] = []

  for (const [index, enabled] of parts.entries()) {
    if (enabled) {
      let max: number = MAX[index]
      if (index === 2) {
        const year = value?.[0] ?? LEAP_YEAR
        const month = value?.[1] ?? 1
        max = new Date(year, month, 0).getDate()
      }

      pickerConfigs.push({
        min: MIN[index],
        max,
        label: LABELS[index],
        showUndefined: false,
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

  const displayedValue = formatDateTimeArray(value)

  const initialPickerValues = fallback
    .map((v, i) => (parts[i] ? (value?.[i] ?? v) : undefined))
    .filter(v => v !== undefined)

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

export default DateTimeFieldInput
