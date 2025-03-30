import { Pressable, Text, StyleProp, ViewStyle } from "react-native"
import { sharedStyles } from "@/styles/sharedStyles"

type AddButtonProps = {
  onPress: () => void
  style?: StyleProp<ViewStyle>
}

export default function AddButton({ onPress, style }: AddButtonProps) {
  return (
    <Pressable
      style={[sharedStyles.card, sharedStyles.addCard, style]}
      onPress={onPress}
    >
      <Text style={sharedStyles.addText}>＋</Text>
    </Pressable>
  )
}
