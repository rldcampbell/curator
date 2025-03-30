import { Modal, Text, View, Pressable } from "react-native"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

type ConfirmModalProps = {
  visible: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <Text style={modalStyles.title}>{title}</Text>
          {message && <Text style={{ marginBottom: 20 }}>{message}</Text>}

          <Pressable
            style={[
              sharedStyles.card,
              modalStyles.addButton,
              modalStyles.buttonInModal,
            ]}
            onPress={onConfirm}
          >
            <Text>{confirmText}</Text>
          </Pressable>

          <Pressable
            style={[
              sharedStyles.card,
              modalStyles.closeButton,
              modalStyles.buttonInModal,
            ]}
            onPress={onCancel}
          >
            <Text>{cancelText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
