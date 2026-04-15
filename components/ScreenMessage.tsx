import { StyleProp, TextStyle, View, ViewStyle } from "react-native"

import AppText from "@/components/AppText"
import { sharedStyles } from "@/styles/sharedStyles"

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
    <View style={[sharedStyles.container, { justifyContent: "center" }, containerStyle]}>
      <AppText style={[sharedStyles.errorText, textStyle]}>{message}</AppText>
    </View>
  )
}
