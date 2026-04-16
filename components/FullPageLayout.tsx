import { ReactNode } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { colors } from "@/styles"

type Props = {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  contentContainerStyle?: ViewStyle
  padding?: number // TODO: temp measure - come up with better solution
}

export default function FullPageLayout({
  header,
  footer,
  children,
  contentContainerStyle,
  padding = 0,
}: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.root, { paddingHorizontal: padding }]}
    >
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={[styles.root, { paddingHorizontal: padding }]}
      >
        {header && (
          <View style={[styles.header, { paddingVertical: padding }]}>
            {header}
          </View>
        )}

        <View
          style={[styles.content, { paddingVertical: padding }, contentContainerStyle]}
        >
          {children}
        </View>

        {footer && (
          <View style={[styles.footer, { paddingVertical: padding }]}>
            {footer}
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
})
