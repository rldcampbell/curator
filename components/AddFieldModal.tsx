import { useEffect, useRef, useState } from "react"
import {
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import DropDownPicker from "react-native-dropdown-picker"

import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

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
  const [fieldType, setFieldType] = useState("text")
  const [items, setItems] = useState([
    { label: "Text", value: "text" },
    { label: "Number", value: "number" },
    { label: "Date", value: "date" },
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
    setFieldType("text")
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <Text style={modalStyles.title}>Add Field</Text>

            <TextInput
              ref={inputRef}
              style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
              placeholder="Field Name (e.g. Title)"
              placeholderTextColor="#999"
              value={fieldName}
              onChangeText={setFieldName}
              maxLength={50}
            />

            <DropDownPicker
              open={open}
              value={fieldType}
              items={items}
              setOpen={setOpen}
              setValue={setFieldType}
              setItems={setItems}
              style={{
                marginBottom: open ? 120 : 20,
                borderRadius: 12,
                borderColor: "#ccc",
              }}
              containerStyle={{ width: "100%", marginBottom: 20 }}
              dropDownContainerStyle={{
                borderRadius: 12,
                borderColor: "#ccc",
              }}
            />

            <Pressable
              style={[
                sharedStyles.card,
                modalStyles.addButton,
                modalStyles.buttonInModal,
              ]}
              onPress={handleAdd}
            >
              <Text style={{ fontWeight: "bold", color: "#007aff" }}>
                Add Field
              </Text>
            </Pressable>

            <Pressable
              style={[
                sharedStyles.card,
                modalStyles.closeButton,
                modalStyles.buttonInModal,
              ]}
              onPress={onClose}
            >
              <Text style={{ fontWeight: "bold", color: "#333" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
