import { DateArray } from "@/app/types"
import AppText from "@/components/AppText"
import { dateArrayToUTCDate, formatDate } from "@/helpers"

import { sharedFieldStyles } from "./styles"

export const DateDisplay = ({ value }: { value?: DateArray }) => {
  if (value === undefined) {
    return null
  }

  return (
    <AppText style={sharedFieldStyles.value}>
      {formatDate(dateArrayToUTCDate(value))}
    </AppText>
  )
}
