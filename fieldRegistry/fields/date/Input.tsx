import { useState } from "react"
import { Pressable } from "react-native"

import DateTimePicker from "@react-native-community/datetimepicker"

import { FieldType } from "@/app/types"
import AppText from "@/components/AppText"
import FieldWrapper from "@/components/FieldWrapper"
import { InputProps } from "@/fieldRegistry/types"
import { dateArrayToUTCDate, dateToDateArray, formatDate } from "@/helpers"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

export const Input = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Date>) => {
  const [showPicker, setShowPicker] = useState(false)
  const [value, setValue] = useState(initialValue)

  return (
    <FieldWrapper label={field.name}>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
      >
        <AppText>
          {Array.isArray(value)
            ? formatDate(dateArrayToUTCDate(value))
            : "Select date"}
        </AppText>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={Array.isArray(value) ? dateArrayToUTCDate(value) : new Date()}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowPicker(false)
            if (selectedDate) {
              const dateArray = dateToDateArray(selectedDate)
              setValue(dateArray)
              onChange(dateArray)
            }
          }}
        />
      )}
    </FieldWrapper>
  )
}
