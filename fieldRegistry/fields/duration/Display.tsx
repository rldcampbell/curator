import { View } from "react-native"

import { DateTimeArray, FieldType, FieldValueMap, RawField } from "@/types"
import AppText from "@/components/AppText"
import { getTemporalIndicesInRange } from "@/helpers/temporal"
import { sharedFieldStyles } from "@/styles/fieldStyles"

const PART_LABELS_FULL = [
  ["year", "years"],
  ["month", "months"],
  ["day", "days"],
  ["hour", "hours"],
  ["minute", "minutes"],
  ["second", "seconds"],
  ["millisecond", "milliseconds"],
] as const

const formatDuration = (
  value: DateTimeArray | undefined,
  activeIndices: number[],
): string | undefined => {
  if (!value || value.every(v => v === undefined)) {
    return undefined
  }

  const parts: string[] = []

  for (const i of activeIndices) {
    const v = value[i] ?? 0
    const [singular, plural] = PART_LABELS_FULL[i]

    if (v !== undefined) {
      parts.push(`${v} ${v === 1 ? singular : plural}`)
    }
  }

  return parts.join(" ")
}

export const Display = ({
  field,
  value,
}: {
  field: Extract<RawField, { type: typeof FieldType.Duration }>
  value?: FieldValueMap[typeof FieldType.Duration] | undefined
}) => {
  if (!value || value.every(v => v === undefined)) {
    return null
  }
  const activeIndices = getTemporalIndicesInRange(field.config)

  return (
    <View style={sharedFieldStyles.valueContainer}>
      <AppText style={sharedFieldStyles.value}>
        {formatDuration(value, activeIndices)}
      </AppText>
    </View>
  )
}
