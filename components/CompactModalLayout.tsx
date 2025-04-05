import { ReactNode } from "react"
import { Text, View, ViewStyle } from "react-native"

import { modalStyles } from "@/styles/modalStyles"

import ModalOverlay from "./ModalOverlay"

type Props = {
  title?: string
  children: ReactNode
  footer?: ReactNode
  contentStyle?: ViewStyle
}

export default function CompactModalLayout({
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
            alignSelf: "center",
            flexShrink: 1,
            maxWidth: "90%",
          },
          contentStyle,
        ]}
      >
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 24,
          }}
        >
          {title && <Text style={modalStyles.title}>{title}</Text>}
          {children}
        </View>

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
