import { Image, Pressable, TextInput, View } from "react-native"

import * as FileSystem from "expo-file-system"

import DateTimePicker from "@react-native-community/datetimepicker"

import {
  FieldId,
  FieldType,
  FieldValue,
  RawField,
  RawFieldAndValue,
} from "@/app/types"
import { dateArrayToUTCDate, dateToDateArray, formatDate } from "@/helpers"
import { pickAndStoreImage } from "@/helpers/image"
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
        const uri = fieldWithValue.value?.[0]

        return (
          <View
            style={[
              sharedStyles.inputCard,
              modalStyles.buttonInModal,
              {
                flexDirection: "column",
                alignItems: "center",
                paddingVertical: 16,
              },
            ]}
          >
            {uri ? (
              <Image
                source={{ uri }}
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
                resizeMode="cover"
              />
            ) : (
              <AppText style={{ color: "#666", marginBottom: 8 }}>
                📷 No image selected
              </AppText>
            )}

            <Pressable
              onPress={async () => {
                const newUri = await pickAndStoreImage()
                if (!newUri) return

                const previousUri = fieldWithValue.value?.[0]
                if (previousUri) {
                  try {
                    await FileSystem.deleteAsync(previousUri, {
                      idempotent: true,
                    })
                  } catch (err) {
                    console.warn("Failed to delete previous image", err)
                  }
                }

                update(fieldId, [newUri])
              }}
            >
              <AppText style={{ color: "#007AFF" }}>
                {uri ? "Replace Image" : "Pick Image"}
              </AppText>
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
