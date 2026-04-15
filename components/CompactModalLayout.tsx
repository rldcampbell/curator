import { ReactNode } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import { colors, modalStyles, spacing } from "@/styles"

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
          styles.content,
          contentStyle,
        ]}
      >
        <View style={styles.body}>
          {title && (
            <AppText weight="bold" style={modalStyles.title}>
              {title}
            </AppText>
          )}
          {children}
        </View>

        {footer && (
          <View style={styles.footer}>
            {footer}
          </View>
        )}
      </View>
    </ModalOverlay>
  )
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    maxWidth: "90%",
    paddingHorizontal: spacing.lg,
  },
  body: {
    paddingVertical: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
  },
})
