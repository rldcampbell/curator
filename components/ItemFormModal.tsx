import { useEffect, useState } from "react"
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"

import DateTimePicker from "@react-native-community/datetimepicker"

import { Field, FieldId, FieldType, FieldValue, Item } from "@/app/types"
import { dateArrayToUTCDate, dateToDateArray, formatDate } from "@/helpers"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import ModalButtonRow from "./ModalButtonRow"

type ItemFormModalProps = {
  mode: "create" | "edit"
  visible: boolean
  initialValues?: Item
  fieldOrder: FieldId[]
  fields: Record<FieldId, Field>
  onSubmit: (item: Item) => void
  onDiscard: () => void
}

export default function ItemFormModal({
  mode,
  visible,
  initialValues,
  fieldOrder,
  fields,
  onSubmit,
  onDiscard,
}: ItemFormModalProps) {
  const [inputValues, setInputValues] = useState<Item>({})
  const [activePickerField, setActivePickerField] = useState<FieldId | null>(
    null,
  )

  useEffect(() => {
    if (visible && mode === "edit" && initialValues) {
      setInputValues(initialValues)
    } else if (visible && mode === "create") {
      setInputValues({})
    }
  }, [visible, mode, initialValues])

  const updateField = (id: FieldId, value: FieldValue) => {
    setInputValues(prev => ({ ...prev, [id]: value }))
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[modalStyles.overlay, { flex: 1 }]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[modalStyles.content, { flex: 1, maxHeight: "90%" }]}>
            <ScrollView
              contentContainerStyle={{
                paddingBottom: 24,
                paddingHorizontal: 24,
                paddingTop: 24,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={modalStyles.title}>
                {mode === "create" ? "New Item" : "Edit Item"}
              </Text>

              {fieldOrder.map(fieldId => {
                const field = fields[fieldId]
                const value = inputValues[fieldId] ?? ""

                switch (field.type) {
                  case FieldType.Text:
                    return (
                      <View
                        key={fieldId}
                        style={{ width: "100%", marginBottom: 8 }}
                      >
                        <Text style={sharedStyles.label}>{field.name}</Text>
                        <TextInput
                          style={[
                            sharedStyles.inputCard,
                            modalStyles.buttonInModal,
                          ]}
                          placeholder={field.name}
                          value={value as string}
                          onChangeText={text => updateField(fieldId, text)}
                        />
                      </View>
                    )
                  case FieldType.Number:
                    return (
                      <View
                        key={fieldId}
                        style={{ width: "100%", marginBottom: 8 }}
                      >
                        <Text style={sharedStyles.label}>{field.name}</Text>
                        <TextInput
                          style={[
                            sharedStyles.inputCard,
                            modalStyles.buttonInModal,
                          ]}
                          placeholder={field.name}
                          value={value?.toString() ?? ""}
                          keyboardType="numeric"
                          onChangeText={text =>
                            updateField(fieldId, parseFloat(text))
                          }
                        />
                      </View>
                    )
                  case FieldType.Date:
                    return (
                      <View
                        key={fieldId}
                        style={{ width: "100%", marginBottom: 8 }}
                      >
                        <Text style={sharedStyles.label}>{field.name}</Text>
                        <Pressable
                          onPress={() => setActivePickerField(fieldId)}
                          style={[
                            sharedStyles.inputCard,
                            modalStyles.buttonInModal,
                          ]}
                        >
                          <Text>
                            {Array.isArray(value)
                              ? formatDate(dateArrayToUTCDate(value))
                              : "Select date"}
                          </Text>
                        </Pressable>
                        {activePickerField === fieldId && (
                          <DateTimePicker
                            value={
                              Array.isArray(value)
                                ? dateArrayToUTCDate(value)
                                : new Date()
                            }
                            mode="date"
                            display="default"
                            onChange={(_, selectedDate) => {
                              setActivePickerField(null)
                              if (selectedDate) {
                                updateField(
                                  fieldId,
                                  dateToDateArray(selectedDate),
                                )
                              }
                            }}
                          />
                        )}
                      </View>
                    )
                  default:
                    return null
                }
              })}

              <ModalButtonRow
                onApply={() => onSubmit(inputValues)}
                applyLabel={mode === "create" ? "Create" : "Update"}
                onDiscard={onDiscard}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  )
}
