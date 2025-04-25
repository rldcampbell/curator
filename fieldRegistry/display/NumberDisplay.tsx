import { View } from "react-native"

import AppText from "@/components/AppText"

import { sharedFieldStyles } from "./styles"

export const NumberDisplay = ({ value }: { value?: number }) => {
  if (value === undefined) {
    return null
  }

  return (
    <View style={sharedFieldStyles.valueContainer}>
      <AppText style={sharedFieldStyles.value}>{value}</AppText>
    </View>
  )
}
