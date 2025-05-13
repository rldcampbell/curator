import { View } from "react-native"

import { DateArray } from "@/app/types"
import AppText from "@/components/AppText"
import { dateArrayToUTCDate, formatDate } from "@/helpers"
import { sharedFieldStyles } from "@/styles/fieldStyles"

export const DateDisplay = ({ value }: { value?: DateArray | undefined }) => {
  if (value === undefined) {
    return null
  }

  return (
    <View style={sharedFieldStyles.valueContainer}>
      <AppText style={sharedFieldStyles.value}>
        {formatDate(dateArrayToUTCDate(value))}
      </AppText>
    </View>
  )
}
