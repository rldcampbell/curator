import { useEffect, useRef, useState } from "react"
import {
  Keyboard,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import DropDownPicker from "react-native-dropdown-picker"

import { FieldType } from "@/app/types"
import { fieldRegistry } from "@/fieldRegistry"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import AppText from "./AppText"
import CompactModalLayout from "./CompactModalLayout"
import ModalButtonRow from "./ModalButtonRow"

type FieldFormModalProps = {
  mode: "create" | "edit"
  visible: boolean
  initialValues?: { name: string; type: FieldType }
  typeUpdateDisabled?: boolean
  onClose: () => void
  onSubmit: (field: { name: string; type: FieldType }) => void
}

export default function FieldFormModal({
  mode,
  visible,
  initialValues,
  typeUpdateDisabled,
  onClose,
  onSubmit,
}: FieldFormModalProps) {
  const [open, setOpen] = useState(false)
  const [fieldName, setFieldName] = useState("")
  const [fieldType, setFieldType] = useState<FieldType>(FieldType.Text)
  const [items, setItems] = useState(
    Object.entries(fieldRegistry).map(([type, { label }]) => ({
      label,
      value: type as FieldType,
    })),
  )

  const inputRef = useRef<TextInput>(null)

  // Populate or reset values on modal open
  useEffect(() => {
    if (visible) {
      if (mode === "edit" && initialValues) {
        setFieldName(initialValues.name)
        setFieldType(initialValues.type)
      } else {
        setFieldName("")
        setFieldType(FieldType.Text)
      }

      // Autofocus
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [visible, mode, initialValues])

  const handleSubmit = () => {
    if (!fieldName.trim()) return
    onSubmit({ name: fieldName.trim(), type: fieldType })
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <CompactModalLayout
          title={mode === "create" ? "Add Field" : "Edit Field"}
          footer={
            <ModalButtonRow
              onApply={handleSubmit}
              applyLabel={mode === "create" ? "Add Field" : "Update Field"}
              onDiscard={onClose}
              discardLabel="Cancel"
            />
          }
        >
          <View style={{ width: "100%", marginBottom: 12 }}>
            <AppText style={sharedStyles.label}>Field Name</AppText>
            <TextInput
              ref={inputRef}
              style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
              placeholder="e.g. Title"
              placeholderTextColor="#999"
              value={fieldName}
              onChangeText={setFieldName}
              maxLength={50}
            />
          </View>

          <View
            style={[
              { width: "100%", marginBottom: 24 },
              typeUpdateDisabled ? sharedStyles.disabled : null,
            ]}
          >
            <AppText style={sharedStyles.label}>Field Type</AppText>
            <DropDownPicker
              disabled={typeUpdateDisabled}
              open={open}
              value={fieldType}
              items={items}
              setOpen={setOpen}
              setValue={setFieldType}
              setItems={setItems}
              style={{
                borderRadius: 12,
                borderColor: "#ccc",
              }}
              containerStyle={{ width: "100%" }}
              dropDownContainerStyle={{
                borderRadius: 12,
                borderColor: "#ccc",
              }}
            />
          </View>
        </CompactModalLayout>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
