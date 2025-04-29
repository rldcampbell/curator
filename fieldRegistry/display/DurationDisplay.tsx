import { View } from "react-native"

import { DateTimeArray } from "@/app/types"
import AppText from "@/components/AppText"

import { sharedFieldStyles } from "./styles"

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
): string | undefined => {
  if (!value || value.every(v => v === undefined)) {
    return undefined
  }

  const parts: string[] = []

  for (const [i, v] of value.entries()) {
    if (v !== undefined) {
      const [singular, plural] = PART_LABELS_FULL[i]
      parts.push(`${v} ${v === 1 ? singular : plural}`)
    }
  }

  return parts.join(" ")
}

export const DurationDisplay = ({ value }: { value?: DateTimeArray }) => {
  if (!value || value.every(v => v === undefined)) {
    return null
  }

  return (
    <View style={sharedFieldStyles.valueContainer}>
      <AppText style={sharedFieldStyles.value}>{formatDuration(value)}</AppText>
    </View>
  )
}
