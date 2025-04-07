import { ReactNode } from "react"
import { View, ViewStyle } from "react-native"

import { modalStyles } from "@/styles/modalStyles"

import AppText from "./AppText"
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
            padding: 16,
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
