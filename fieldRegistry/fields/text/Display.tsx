import { View } from "react-native"

import AppText from "@/components/AppText"
import { sharedFieldStyles } from "@/styles/fieldStyles"

export const Display = ({ value }: { value?: string | undefined }) => {
  if (value === undefined) {
    return null
  }

  return (
    <View style={sharedFieldStyles.valueContainer}>
      <AppText style={sharedFieldStyles.value}>{value}</AppText>
    </View>
  )
}
