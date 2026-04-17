import {
  DateTimeArray,
  DateTimeFieldConfig,
  DateTimeUnit,
  DateTimeParts,
  DurationArray,
  DurationFieldConfig,
  DurationUnit,
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

const DATE_TIME_TEXT_WIDTHS: Record<DateTimeUnit, number> = {
  year: 4,
  month: 2,
  day: 2,
  hour: 2,
  minute: 2,
  second: 2,
  ms: 3,
}

const DATE_TIME_BASE_BOUNDS: Record<
  Exclude<DateTimeUnit, "day">,
  { min: number; max: number }
> = {
  year: { min: 0, max: 9999 },
  month: { min: 1, max: 12 },
  hour: { min: 0, max: 23 },
  minute: { min: 0, max: 59 },
  second: { min: 0, max: 59 },
  ms: { min: 0, max: 999 },
}

const DURATION_LOWER_UNIT_MAX: Partial<Record<DurationUnit, number>> = {
  month: 11,
  day: 31,
  hour: 23,
  minute: 59,
  second: 59,
  ms: 999,
}

const DURATION_UNIT_SUFFIXES: Record<Exclude<DurationUnit, "ms">, string> = {
  year: "Y",
  month: "M",
  day: "D",
  hour: "H",
  minute: "M",
  second: "S",
}

const DURATION_TOP_UNIT_PICKER_MAX = 9999
const LEAP_SAFE_YEAR = 2000

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

export const isTemporalRangeValid = (config: TemporalFieldConfig): boolean =>
  getTemporalUnitIndex(config.topUnit) <= getTemporalUnitIndex(config.bottomUnit)

export const getTemporalUnitsInRange = <
  TUnit extends TemporalUnit,
  TConfig extends TemporalFieldConfig<TUnit>,
>(
  config: TConfig,
): TUnit[] => {
  if (!isTemporalRangeValid(config)) {
    return []
  }

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

const parseCanonicalUnsignedInteger = (
  text: string,
  cursor: number,
): { value: number; nextCursor: number } | undefined => {
  const match = text.slice(cursor).match(/^(0|[1-9]\d*)/)

  if (!match) {
    return undefined
  }

  const value = Number(match[1])

  if (!Number.isSafeInteger(value)) {
    return undefined
  }

  return {
    value,
    nextCursor: cursor + match[1].length,
  }
}

const formatFractionalMilliseconds = (value: number): string =>
  value.toString().padStart(3, "0")

const formatMillisecondsAsSeconds = (value: number): string =>
  `${Math.floor(value / 1000)}.${formatFractionalMilliseconds(value % 1000)}S`

const getDaysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate()

const getYearlessMonthDayMax = (month: number): number =>
  month === 2 ? 29 : getDaysInMonth(LEAP_SAFE_YEAR, month)

const getDateTimeTextDelimiter = (
  previousUnit: DateTimeUnit,
  nextUnit: DateTimeUnit,
): string => {
  if (previousUnit === "day" && nextUnit === "hour") {
    return "T"
  }

  if (nextUnit === "ms") {
    return "."
  }

  if (getTemporalUnitIndex(previousUnit) <= getTemporalUnitIndex("day")) {
    return "-"
  }

  return ":"
}

export const getDateTimeValueIndex = (
  config: DateTimeFieldConfig,
  unit: DateTimeUnit,
): number => getTemporalUnitsInRange(config).indexOf(unit)

export const getDateTimeValueAtUnit = (
  config: DateTimeFieldConfig,
  value: DateTimeArray | undefined,
  unit: DateTimeUnit,
): number | undefined => {
  const index = getDateTimeValueIndex(config, unit)

  return index >= 0 ? value?.[index] : undefined
}

export const getDateTimeDayMax = (
  config: DateTimeFieldConfig,
  value: DateTimeArray | undefined,
): number => {
  const month = getDateTimeValueAtUnit(config, value, "month")

  if (month === undefined) {
    return 31
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return 31
  }

  const year = getDateTimeValueAtUnit(config, value, "year")

  if (year === undefined) {
    return getYearlessMonthDayMax(month)
  }

  if (!Number.isInteger(year) || year < 0 || year > 9999) {
    return getYearlessMonthDayMax(month)
  }

  return getDaysInMonth(year, month)
}

export const getDateTimeUnitBounds = (
  config: DateTimeFieldConfig,
  value: DateTimeArray | undefined,
  unit: DateTimeUnit,
): { min: number; max: number } => {
  if (unit === "day") {
    return {
      min: 1,
      max: getDateTimeDayMax(config, value),
    }
  }

  return DATE_TIME_BASE_BOUNDS[unit]
}

export const validateDateTimeValue = (
  config: DateTimeFieldConfig,
  value: unknown,
): value is DateTimeArray => {
  if (!Array.isArray(value) || !isTemporalRangeValid(config)) {
    return false
  }

  const units = getTemporalUnitsInRange(config)

  if (value.length !== units.length) {
    return false
  }

  for (const component of value) {
    if (!Number.isInteger(component)) {
      return false
    }
  }

  for (const [index, unit] of units.entries()) {
    const component = value[index]

    if (component === undefined) {
      return false
    }

    const { min, max } = getDateTimeUnitBounds(config, value, unit)

    if (component < min || component > max) {
      return false
    }
  }

  return true
}

const formatDateTimeUnitValue = (unit: DateTimeUnit, value: number): string =>
  value.toString().padStart(DATE_TIME_TEXT_WIDTHS[unit], "0")

export const formatDateTimeValue = (
  config: DateTimeFieldConfig,
  value: DateTimeArray | undefined,
  fallback?: string,
): string | undefined => {
  if (!value || !validateDateTimeValue(config, value)) {
    return fallback
  }

  const units = getTemporalUnitsInRange(config)

  return units.reduce((text, unit, index) => {
    const prefix =
      index === 0 ? "" : getDateTimeTextDelimiter(units[index - 1], unit)

    return `${text}${prefix}${formatDateTimeUnitValue(unit, value[index])}`
  }, "")
}

export const parseDateTimeValue = (
  config: DateTimeFieldConfig,
  text: string | undefined,
): DateTimeArray | undefined => {
  if (!text || !isTemporalRangeValid(config)) {
    return undefined
  }

  const units = getTemporalUnitsInRange(config)
  const value: number[] = []
  let cursor = 0

  for (const [index, unit] of units.entries()) {
    if (index > 0) {
      const delimiter = getDateTimeTextDelimiter(units[index - 1], unit)

      if (text.slice(cursor, cursor + delimiter.length) !== delimiter) {
        return undefined
      }

      cursor += delimiter.length
    }

    const width = DATE_TIME_TEXT_WIDTHS[unit]
    const segment = text.slice(cursor, cursor + width)

    if (segment.length !== width || !/^\d+$/.test(segment)) {
      return undefined
    }

    value.push(Number(segment))
    cursor += width
  }

  if (cursor !== text.length) {
    return undefined
  }

  return validateDateTimeValue(config, value) ? value : undefined
}

export const getDefaultDateTimeValue = (
  config: DateTimeFieldConfig,
  now: Date = new Date(),
): DateTimeArray =>
  getTemporalUnitsInRange(config).map(unit => {
    switch (unit) {
      case "year":
        return now.getFullYear()
      case "month":
        return now.getMonth() + 1
      case "day":
        return now.getDate()
      case "hour":
        return 12
      case "minute":
      case "second":
      case "ms":
        return 0
    }
  })

export const getDefaultDurationValue = (
  config: DurationFieldConfig,
): DurationArray => getTemporalUnitsInRange(config).map(() => 0)

export const getDurationUnitBounds = (
  config: DurationFieldConfig,
  unit: DurationUnit,
): { min: number; max?: number } => {
  if (unit === config.topUnit) {
    return { min: 0 }
  }

  const max = DURATION_LOWER_UNIT_MAX[unit]

  return max === undefined ? { min: 0 } : { min: 0, max }
}

export const getDurationPickerUnitBounds = (
  config: DurationFieldConfig,
  value: DurationArray | undefined,
  unit: DurationUnit,
): { min: number; max: number } => {
  const bounds = getDurationUnitBounds(config, unit)

  if (bounds.max !== undefined) {
    return {
      min: bounds.min,
      max: bounds.max,
    }
  }

  const index = getTemporalUnitsInRange(config).indexOf(unit)
  const currentValue = index >= 0 ? value?.[index] ?? 0 : 0

  return {
    min: 0,
    max: Math.max(DURATION_TOP_UNIT_PICKER_MAX, currentValue),
  }
}

export const validateDurationValue = (
  config: DurationFieldConfig,
  value: unknown,
): value is DurationArray => {
  if (!Array.isArray(value) || !isTemporalRangeValid(config)) {
    return false
  }

  const units = getTemporalUnitsInRange(config)

  if (value.length !== units.length) {
    return false
  }

  for (const [index, unit] of units.entries()) {
    const component = value[index]

    if (!Number.isSafeInteger(component) || component < 0) {
      return false
    }

    if (index > 0) {
      const max = DURATION_LOWER_UNIT_MAX[unit]

      if (max !== undefined && component > max) {
        return false
      }
    }
  }

  return true
}

export const formatDurationValue = (
  config: DurationFieldConfig,
  value: DurationArray | undefined,
  fallback?: string,
): string | undefined => {
  if (!value || !validateDurationValue(config, value)) {
    return fallback
  }

  const units = getTemporalUnitsInRange(config)
  let text = ""

  for (const [index, unit] of units.entries()) {
    if (index > 0 && units[index - 1] === "day" && unit === "hour") {
      text += "T"
    }

    if (unit === "second" && units[index + 1] === "ms") {
      text += `${value[index]}.${formatFractionalMilliseconds(value[index + 1])}S`
      continue
    }

    if (unit === "ms") {
      if (index === 0) {
        text += formatMillisecondsAsSeconds(value[index])
      }

      continue
    }

    text += `${value[index]}${DURATION_UNIT_SUFFIXES[unit]}`
  }

  return text
}

export const parseDurationValue = (
  config: DurationFieldConfig,
  text: string | undefined,
): DurationArray | undefined => {
  if (!text || !isTemporalRangeValid(config)) {
    return undefined
  }

  const units = getTemporalUnitsInRange(config)
  const value: number[] = []
  let cursor = 0

  for (const [index, unit] of units.entries()) {
    if (index > 0 && units[index - 1] === "day" && unit === "hour") {
      if (text[cursor] !== "T") {
        return undefined
      }

      cursor += 1
    }

    if (unit === "ms" && index > 0) {
      continue
    }

    const integer = parseCanonicalUnsignedInteger(text, cursor)

    if (!integer) {
      return undefined
    }

    cursor = integer.nextCursor

    if (unit === "second" && units[index + 1] === "ms") {
      if (text[cursor] !== ".") {
        return undefined
      }

      const fractional = text.slice(cursor + 1, cursor + 4)

      if (!/^\d{3}$/.test(fractional) || text[cursor + 4] !== "S") {
        return undefined
      }

      value.push(integer.value, Number(fractional))
      cursor += 5
      continue
    }

    if (unit === "ms") {
      if (text[cursor] !== ".") {
        return undefined
      }

      const fractional = text.slice(cursor + 1, cursor + 4)

      if (!/^\d{3}$/.test(fractional) || text[cursor + 4] !== "S") {
        return undefined
      }

      value.push(integer.value * 1000 + Number(fractional))
      cursor += 5
      continue
    }

    if (text[cursor] !== DURATION_UNIT_SUFFIXES[unit]) {
      return undefined
    }

    value.push(integer.value)
    cursor += 1
  }

  if (cursor !== text.length) {
    return undefined
  }

  return validateDurationValue(config, value) ? value : undefined
}
