import { ReactNode } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"

type Props = {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  contentContainerStyle?: ViewStyle
}

export default function FullPageLayout({
  header,
  footer,
  children,
  contentContainerStyle,
}: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <SafeAreaView style={styles.root}>
        {header && <View style={styles.header}>{header}</View>}

        <View style={[styles.content, contentContainerStyle]}>{children}</View>

        {footer && <View style={styles.footer}>{footer}</View>}
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const PAGE_PADDING = 16

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: PAGE_PADDING,
  },
  header: {
    paddingVertical: PAGE_PADDING,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  content: {
    paddingVertical: PAGE_PADDING,
  },
  footer: {
    paddingVertical: PAGE_PADDING,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
})
