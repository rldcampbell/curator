import { useEffect, useRef, useState } from "react"
import { Modal, View, Text, TextInput, Pressable } from "react-native"
import { sharedStyles } from "@/styles/sharedStyles"
import { modalStyles } from "@/styles/modalStyles"
import DropDownPicker from "react-native-dropdown-picker"

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
    if (!fieldName.trim()) return // optional: prevent empty name

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

          {/* Submit */}
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

          {/* Cancel */}
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
    </Modal>
  )
}
