import { ReactNode } from "react"
import { View, ViewStyle } from "react-native"

import { modalStyles } from "@/styles/modalStyles"

import AppText from "./AppText"
import ModalOverlay from "./ModalOverlay"

type Props = {
  title?: string | undefined
  children: ReactNode
  footer?: ReactNode
  contentStyle?: ViewStyle
  visible: boolean
  onRequestClose: () => void
}

export default function CompactModalLayout({
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
            alignSelf: "center",
            // flexShrink: 1,
            maxWidth: "90%",
            paddingHorizontal: 16,
          },
          contentStyle,
        ]}
      >
        <View
          style={{
            paddingVertical: 16,
          }}
        >
          {title && (
            <AppText weight="bold" style={modalStyles.title}>
              {title}
            </AppText>
          )}
          {children}
        </View>

        {footer && (
          <View
            style={{
              paddingVertical: 16,
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
