import { View } from "react-native"

import AppText from "@/components/AppText"
import { layoutStyles } from "@/styles"

export default function SettingsScreen() {
  return (
    <View style={[layoutStyles.fill, layoutStyles.centered]}>
      <AppText>Settings Screen</AppText>
    </View>
  )
}
