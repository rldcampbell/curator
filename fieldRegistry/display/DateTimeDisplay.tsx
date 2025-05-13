import { View } from "react-native"

import { DateTimeArray } from "@/app/types"
import AppText from "@/components/AppText"
import { formatDateTimeArray } from "@/helpers/date"
import { sharedFieldStyles } from "@/styles/fieldStyles"

export const DateTimeDisplay = ({
  value,
}: {
  value?: DateTimeArray | undefined
}) => {
  if (!value || value.every(v => v === undefined)) {
    return null
  }

  return (
    <View style={sharedFieldStyles.valueContainer}>
      <AppText style={sharedFieldStyles.value}>
        {formatDateTimeArray(value)}
      </AppText>
    </View>
  )
}
