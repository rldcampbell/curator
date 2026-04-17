import { View } from "react-native"

import { FieldType, FieldValueMap, RawField } from "@/types"
import AppText from "@/components/AppText"
import { formatDateTimeArray } from "@/helpers/date"
import { temporalConfigToParts } from "@/helpers/temporal"
import { sharedFieldStyles } from "@/styles/fieldStyles"

export const Display = ({
  field,
  value,
}: {
  field: Extract<RawField, { type: typeof FieldType.DateTime }>
  value?: FieldValueMap[typeof FieldType.DateTime] | undefined
}) => {
  if (!value || value.every(v => v === undefined)) {
    return null
  }
  const parts = temporalConfigToParts(field.config)

  return (
    <View style={sharedFieldStyles.valueContainer}>
      <AppText style={sharedFieldStyles.value}>
        {formatDateTimeArray(value, parts)}
      </AppText>
    </View>
  )
}
