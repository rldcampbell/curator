import { ReactNode } from "react"
import { ScrollView, View, ViewStyle } from "react-native"

import { modalStyles } from "@/styles/modalStyles"

import AppText from "./AppText"
import ModalOverlay from "./ModalOverlay"

type Props = {
  title?: string
  children: ReactNode
  footer?: ReactNode
  contentStyle?: ViewStyle
  visible: boolean
  onRequestClose: () => void
}

export default function ScrollableModalLayout({
  title,
  children,
  footer,
  contentStyle,
  visible,
  onRequestClose,
}: Props) {
  return (
    <ModalOverlay visible={visible} onRequestClose={onRequestClose}>
      <View
        style={[
          modalStyles.content,
          {
            flex: 1,
          },
          contentStyle,
        ]}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {title && (
            <AppText weight="bold" style={modalStyles.title}>
              {title}
            </AppText>
          )}
          {children}
        </ScrollView>

        {footer && (
          <View
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderColor: "#eee",
            }}
          >
            {footer}
          </View>
        )}
      </View>
    </ModalOverlay>
  )
}
