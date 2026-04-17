import {
  DateTimeFieldConfig,
  DateTimeParts,
  DurationFieldConfig,
  TEMPORAL_UNITS,
  TemporalFieldConfig,
  TemporalUnit,
} from "@/types"

export const TEMPORAL_UNIT_LABELS: Record<TemporalUnit, string> = {
  year: "Year",
  month: "Month",
  day: "Day",
  hour: "Hour",
  minute: "Minute",
  second: "Second",
  ms: "Millisecond",
}

export const TEMPORAL_UNIT_SHORT_LABELS: Record<TemporalUnit, string> = {
  year: "Y",
  month: "M",
  day: "D",
  hour: "h",
  minute: "m",
  second: "s",
  ms: "ms",
}

const TEMPORAL_UNIT_INDEX: Record<TemporalUnit, number> = Object.fromEntries(
  TEMPORAL_UNITS.map((unit, index) => [unit, index]),
) as Record<TemporalUnit, number>

export const defaultDateTimeFieldConfig: DateTimeFieldConfig = {
  topUnit: "year",
  bottomUnit: "ms",
}

export const defaultDurationFieldConfig: DurationFieldConfig = {
  topUnit: "year",
  bottomUnit: "ms",
}

export const getTemporalUnitIndex = (unit: TemporalUnit): number =>
  TEMPORAL_UNIT_INDEX[unit]

export const getTemporalUnitsInRange = <
  TUnit extends TemporalUnit,
  TConfig extends TemporalFieldConfig<TUnit>,
>(
  config: TConfig,
): TUnit[] => {
  const start = getTemporalUnitIndex(config.topUnit)
  const end = getTemporalUnitIndex(config.bottomUnit)

  return TEMPORAL_UNITS.slice(start, end + 1) as TUnit[]
}

export const getTemporalIndicesInRange = (
  config: TemporalFieldConfig,
): number[] => getTemporalUnitsInRange(config).map(getTemporalUnitIndex)

export const temporalConfigToParts = (
  config: TemporalFieldConfig,
): DateTimeParts => {
  const start = getTemporalUnitIndex(config.topUnit)
  const end = getTemporalUnitIndex(config.bottomUnit)

  return TEMPORAL_UNITS.map((_, index) => index >= start && index <= end) as
    DateTimeParts
}
