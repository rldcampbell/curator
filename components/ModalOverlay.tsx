import { ReactNode } from "react"
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  View,
} from "react-native"

type ModalOverlayProps = {
  children: ReactNode
  visible: boolean
  onRequestClose: () => void
}

export default function ModalOverlay({
  children,
  visible,
  onRequestClose,
}: ModalOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            }}
          >
            {children}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  )
}
