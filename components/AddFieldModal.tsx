import { useEffect, useRef, useState } from "react"
import {
  Keyboard,
  Modal,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import DropDownPicker from "react-native-dropdown-picker"

import { FieldType } from "@/app/types"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import ModalButtonRow from "./ModalButtonRow"
import ScrollableModalLayout from "./ScrollableModalLayout"

type AddFieldModalProps = {
  visible: boolean
  onClose: () => void
  onSubmit: (field: { name: string; type: string }) => void
}

export default function AddFieldModal({
  visible,
  onClose,
  onSubmit,
}: AddFieldModalProps) {
  const [open, setOpen] = useState(false)
  const [fieldName, setFieldName] = useState("")
  const [fieldType, setFieldType] = useState(FieldType.Text)
  const [items, setItems] = useState([
    { label: "Text", value: FieldType.Text },
    { label: "Number", value: FieldType.Number },
    { label: "Date", value: FieldType.Date },
  ])

  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [visible])

  const handleAdd = () => {
    if (!fieldName.trim()) return
    onSubmit({ name: fieldName.trim(), type: fieldType })
    setFieldName("")
    setFieldType(FieldType.Text)
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
        <ScrollableModalLayout
          title="Add Field"
          footer={
            <ModalButtonRow
              onApply={handleAdd}
              applyLabel="Add Field"
              onDiscard={onClose}
              discardLabel="Cancel"
            />
          }
        >
          <View style={{ width: "100%", marginBottom: 12 }}>
            <Text style={sharedStyles.label}>Field Name</Text>
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

          <View style={{ width: "100%", marginBottom: 24 }}>
            <Text style={sharedStyles.label}>Field Type</Text>
            <DropDownPicker
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
        </ScrollableModalLayout>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
