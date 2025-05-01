import { View } from "react-native"

import AppText from "@/components/AppText"

import { sharedFieldStyles } from "./styles"

export const BooleanDisplay = ({ value }: { value?: boolean | undefined }) => {
  if (value === undefined) {
    return null
  }

  return (
    <View style={sharedFieldStyles.valueContainer}>
      <AppText style={sharedFieldStyles.value}>{value ? "Yes" : "No"}</AppText>
    </View>
  )
}
