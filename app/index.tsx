import { View } from "react-native"

import AppText from "@/components/AppText"
import { layoutStyles } from "@/styles"

export default function HomeScreen() {
  return (
    <View style={[layoutStyles.fill, layoutStyles.centered]}>
      <AppText>Home Screen</AppText>
    </View>
  )
}
