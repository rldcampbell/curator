// fieldRegistry/text/display.tsx
import { View } from "react-native"

import AppText from "@/components/AppText"

import { sharedFieldStyles } from "./styles"

export const TextDisplay = ({ value }: { value?: string }) => (
  <View style={sharedFieldStyles.valueContainer}>
    <AppText style={sharedFieldStyles.value}>{value}</AppText>
  </View>
)
