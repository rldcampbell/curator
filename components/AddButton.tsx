import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native"

import { colors, surfaceStyles } from "@/styles"

import AppText from "./AppText"

type AddButtonProps = {
  onPress: () => void
  style?: StyleProp<ViewStyle>
  label?: string
}

export default function AddButton({
  onPress,
  style,
  label = "+",
}: AddButtonProps) {
  return (
    <Pressable style={[surfaceStyles.card, styles.card, style]} onPress={onPress}>
      <AppText weight="bold" style={styles.text}>
        {label}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentSoft,
  },
  text: {
    fontSize: 32,
    color: colors.accent,
  },
})
