import { ReactNode } from "react"
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { colors, layoutStyles } from "@/styles"

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
        style={layoutStyles.fill}
      >
        <SafeAreaView style={layoutStyles.fill}>
          <View style={styles.overlay}>
            {children}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.overlay,
  },
})
