import { ReactNode } from "react"
import { ScrollView, Text, View, ViewStyle } from "react-native"

import { modalStyles } from "@/styles/modalStyles"

import ModalOverlay from "./ModalOverlay"

type Props = {
  title?: string
  children: ReactNode
  footer?: ReactNode
  contentStyle?: ViewStyle
}

export default function ScrollableModalLayout({
  title,
  children,
  footer,
  contentStyle,
}: Props) {
  return (
    <ModalOverlay>
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
          {title && <Text style={modalStyles.title}>{title}</Text>}
          {children}
        </ScrollView>

        {footer && (
          <View
            style={{
              paddingTop: 8,
              paddingHorizontal: 16,
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
