import { ReactNode } from "react"
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native"

import { colors, layoutStyles, modalStyles, spacing } from "@/styles"

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
          layoutStyles.fill,
          contentStyle,
        ]}
      >
        <ScrollView
          style={layoutStyles.fill}
          contentContainerStyle={styles.scrollContent}
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
          <View style={styles.footer}>
            {footer}
          </View>
        )}
      </View>
    </ModalOverlay>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
  },
})
