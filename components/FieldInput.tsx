import { Pressable, TextInput, View } from "react-native"

import DateTimePicker from "@react-native-community/datetimepicker"

import {
  FieldId,
  FieldType,
  FieldValue,
  RawField,
  RawFieldAndValue,
} from "@/app/types"
import { dateArrayToUTCDate, dateToDateArray, formatDate } from "@/helpers"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import AppText from "./AppText"

type FieldInputProps = {
  fieldId: FieldId
  field: RawField
  value: FieldValue | undefined
  update: (fieldId: FieldId, value: FieldValue) => void
  activePickerField: FieldId | null
  setActivePickerField: (id: FieldId | null) => void
}

export default function FieldInput({
  fieldId,
  field,
  value,
  update,
  activePickerField,
  setActivePickerField,
}: FieldInputProps) {
  const fieldWithValue = { ...field, value } as RawFieldAndValue

  const renderInput = () => {
    switch (fieldWithValue.type) {
      case FieldType.Text:
        return (
          <TextInput
            style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
            placeholder={fieldWithValue.name}
            value={fieldWithValue.value}
            onChangeText={text => update(fieldId, text)}
          />
        )

      case FieldType.Number:
        return (
          <TextInput
            style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
            placeholder={fieldWithValue.name}
            value={fieldWithValue.value?.toString() ?? ""}
            keyboardType="numeric"
            onChangeText={text => update(fieldId, parseFloat(text))}
          />
        )

      case FieldType.Date:
        return (
          <>
            <Pressable
              onPress={() => setActivePickerField(fieldId)}
              style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
            >
              <AppText>
                {Array.isArray(fieldWithValue.value)
                  ? formatDate(dateArrayToUTCDate(fieldWithValue.value))
                  : "Select date"}
              </AppText>
            </Pressable>
            {activePickerField === fieldId && (
              <DateTimePicker
                value={
                  Array.isArray(fieldWithValue.value)
                    ? dateArrayToUTCDate(fieldWithValue.value)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setActivePickerField(null)
                  if (selectedDate) {
                    update(fieldId, dateToDateArray(selectedDate))
                  }
                }}
              />
            )}
          </>
        )

      case FieldType.Image:
        return (
          <View
            style={[
              sharedStyles.inputCard,
              modalStyles.buttonInModal,
              {
                flexDirection: "column",
                alignItems: "center",
                paddingVertical: 24,
              },
            ]}
          >
            <AppText style={{ color: "#666", marginBottom: 8 }}>
              📷 No image selected
            </AppText>
            <Pressable onPress={() => console.log("Pick image for", fieldId)}>
              <AppText style={{ color: "#007AFF" }}>Pick Image</AppText>
            </Pressable>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View key={fieldId} style={[{ width: "100%", marginBottom: 8 }]}>
      <AppText style={sharedStyles.label}>{fieldWithValue.name}</AppText>
      {renderInput()}
    </View>
  )
}
