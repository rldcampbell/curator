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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
})
