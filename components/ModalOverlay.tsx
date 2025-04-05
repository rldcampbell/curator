import { ReactNode } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native"

import { modalStyles } from "@/styles/modalStyles"

type ModalOverlayProps = {
  children: ReactNode
}

export default function ModalOverlay({ children }: ModalOverlayProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[modalStyles.overlay, { flex: 1 }]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {children}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
