import { useEffect, useState } from "react"
import { Modal, Pressable, TextInput, View } from "react-native"

import DateTimePicker from "@react-native-community/datetimepicker"

import { Field, FieldId, FieldType, FieldValue, Item } from "@/app/types"
import { dateArrayToUTCDate, dateToDateArray, formatDate } from "@/helpers"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import AppText from "./AppText"
import ModalButtonRow from "./ModalButtonRow"
import ScrollableModalLayout from "./ScrollableModalLayout"

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
      <ScrollableModalLayout
        title={mode === "create" ? "New Item" : "Edit Item"}
        footer={
          <ModalButtonRow
            onApply={() => onSubmit(inputValues)}
            applyLabel={mode === "create" ? "Create" : "Update"}
            onDiscard={onDiscard}
          />
        }
      >
        {fieldOrder.map(fieldId => {
          const field = fields[fieldId]
          const value = inputValues[fieldId] ?? ""

          switch (field.type) {
            case FieldType.Text:
              return (
                <View key={fieldId} style={{ width: "100%", marginBottom: 8 }}>
                  <AppText style={sharedStyles.label}>{field.name}</AppText>
                  <TextInput
                    style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
                    placeholder={field.name}
                    value={value as string}
                    onChangeText={text => updateField(fieldId, text)}
                  />
                </View>
              )
            case FieldType.Number:
              return (
                <View key={fieldId} style={{ width: "100%", marginBottom: 8 }}>
                  <AppText style={sharedStyles.label}>{field.name}</AppText>
                  <TextInput
                    style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
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
                <View key={fieldId} style={{ width: "100%", marginBottom: 8 }}>
                  <AppText style={sharedStyles.label}>{field.name}</AppText>
                  <Pressable
                    onPress={() => setActivePickerField(fieldId)}
                    style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
                  >
                    <AppText>
                      {Array.isArray(value)
                        ? formatDate(dateArrayToUTCDate(value))
                        : "Select date"}
                    </AppText>
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
                          updateField(fieldId, dateToDateArray(selectedDate))
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
      </ScrollableModalLayout>
    </Modal>
  )
}
