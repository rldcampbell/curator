import { Pressable, StyleProp, ViewStyle } from "react-native"

import { sharedStyles } from "@/styles/sharedStyles"

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
    <Pressable
      style={[sharedStyles.card, sharedStyles.addCard, style]}
      onPress={onPress}
    >
      <AppText weight="bold" style={sharedStyles.addText}>
        {label}
      </AppText>
    </Pressable>
  )
}
