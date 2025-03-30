// components/CreateItemModal.tsx
import { useState } from "react"
import {
  Modal,
  Text,
  View,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"
import { Field, FieldId, FieldValue, Item } from "@/app/types"
import ModalButtonRow from "./ModalButtonRow"
import { dateArrayToUTCDate, dateToDateArray } from "@/helpers"

type CreateItemModalProps = {
  visible: boolean
  fieldOrder: FieldId[]
  fields: Record<FieldId, Field>
  onCreate: (item: Item) => void
  onDiscard: () => void
}

export default function CreateItemModal({
  visible,
  fieldOrder,
  fields,
  onCreate,
  onDiscard,
}: CreateItemModalProps) {
  const [inputValues, setInputValues] = useState<Item>({})

  const updateField = (id: FieldId, value: FieldValue) => {
    setInputValues(prev => ({ ...prev, [id]: value }))
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={modalStyles.overlay}
      >
        <View style={modalStyles.content}>
          <Text style={modalStyles.title}>New Item</Text>

          {fieldOrder.map(fieldId => {
            const field = fields[fieldId]
            const value = inputValues[fieldId] ?? ""

            switch (field.type) {
              case "text":
                return (
                  <View>
                    <Text style={sharedStyles.label}>{field.name}</Text>
                    <TextInput
                      key={fieldId}
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
              case "number":
                return (
                  <View>
                    <Text style={sharedStyles.label}>{field.name}</Text>
                    <TextInput
                      key={fieldId}
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
              case "date":
                return (
                  <View>
                    <Text style={sharedStyles.label}>{field.name}</Text>
                    <DateTimePicker
                      key={fieldId}
                      value={
                        Array.isArray(value)
                          ? dateArrayToUTCDate(value)
                          : new Date()
                      }
                      mode="date"
                      display="default"
                      onChange={(_, selectedDate) => {
                        if (selectedDate) {
                          updateField(fieldId, dateToDateArray(selectedDate))
                        }
                      }}
                    />
                  </View>
                )
              default:
                return null
            }
          })}

          <ModalButtonRow
            onCreate={() => {
              onCreate(inputValues)
            }}
            onDiscard={onDiscard}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
