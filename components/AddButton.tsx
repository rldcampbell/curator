import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native"

import { Ionicons } from "@expo/vector-icons"

import { colors, radii, shadows } from "@/styles"

type AddButtonProps = {
  onPress: () => void
  style?: StyleProp<ViewStyle>
}

export default function AddButton({ onPress, style }: AddButtonProps) {
  return (
    <Pressable style={[styles.bubble, style]} onPress={onPress}>
      <Ionicons name="add" size={28} color={colors.accent} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  bubble: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
})
