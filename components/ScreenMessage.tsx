import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native"

import AppText from "@/components/AppText"
import { layoutStyles, screenStyles, spacing } from "@/styles"

type ScreenMessageProps = {
  message: string
  containerStyle?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export default function ScreenMessage({
  message,
  containerStyle,
  textStyle,
}: ScreenMessageProps) {
  return (
    <View
      style={[
        screenStyles.mutedCanvas,
        layoutStyles.alignCenter,
        layoutStyles.justifyCenter,
        containerStyle,
      ]}
    >
      <AppText style={[styles.text, textStyle]}>{message}</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    padding: spacing.xl,
  },
})
