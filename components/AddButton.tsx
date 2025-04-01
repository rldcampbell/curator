import { Pressable, StyleProp, Text, ViewStyle } from "react-native"

import { sharedStyles } from "@/styles/sharedStyles"

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
    <Pressable
      style={[sharedStyles.card, sharedStyles.addCard, style]}
      onPress={onPress}
    >
      <Text style={sharedStyles.addText}>{label}</Text>
    </Pressable>
  )
}
