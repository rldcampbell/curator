import { View } from "react-native"

import { FieldType, FieldValueMap, RawField } from "@/types"
import AppText from "@/components/AppText"
import { formatDateTimeValue } from "@/helpers/temporal"
import { sharedFieldStyles } from "@/styles/fieldStyles"

export const Display = ({
  field,
  value,
}: {
  field: Extract<RawField, { type: typeof FieldType.DateTime }>
  value?: FieldValueMap[typeof FieldType.DateTime] | undefined
}) => {
  const text = formatDateTimeValue(field.config, value)

  if (!text) {
    return null
  }

  return (
    <View style={sharedFieldStyles.valueContainer}>
      <AppText style={sharedFieldStyles.value}>{text}</AppText>
    </View>
  )
}
