import { DateTimeArray, DateTimeParts } from "@/app/types"

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const LABELS = ["y", "m", "d", "h", "m", "s", "ms"] as const

export const timestampNow = () => Date.now()

export const timestampToDate = (ts: number) => new Date(ts)

export function dateTimeArrayToIsoDuration(value: DateTimeArray): string {
  const [y, m, d, h, min, s, ms] = value

  let result = "P"

  if (y !== undefined) result += `${y}Y`
  if (m !== undefined) result += `${m}M`
  if (d !== undefined) result += `${d}D`

  if ([h, min, s, ms].some(v => v !== undefined)) {
    result += "T"
    if (h !== undefined) result += `${h}H`
    if (min !== undefined) result += `${min}M`
    if (s !== undefined) result += s
    if (ms !== undefined) result += `.${`${ms}`.padStart(3, "0")}`
    if (s !== undefined || ms !== undefined) result += "S"
  }

  return result
}

export function isoDurationToDateTimeArray(
  text: string,
): DateTimeArray | undefined {
  const regex =
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d*(?:\.\d+)?)S)?)?$/

  const match = text.match(regex)

  if (!match) {
    return undefined
  }

  const y = match[1] ? parseInt(match[1], 10) : undefined
  const m = match[2] ? parseInt(match[2], 10) : undefined
  const d = match[3] ? parseInt(match[3], 10) : undefined
  const h = match[4] ? parseInt(match[4], 10) : undefined
  const min = match[5] ? parseInt(match[5], 10) : undefined

  const sAndMs = match[6]

  let s: number | undefined
  let ms: number | undefined

  if (sAndMs !== undefined) {
    const [sPart, msPart] = sAndMs.split(".")

    if (sPart) s = parseInt(sPart, 10)
    if (msPart) ms = parseInt(msPart.padEnd(3, "0"), 10)
  }

  return [y, m, d, h, min, s, ms]
}

export const safeDateTimeArrayToUTCDate = (
  arr: DateTimeArray,
  fallback?: DateTimeArray,
): Date => {
  const [
    year = fallback?.[0] ?? 2000,
    month = fallback?.[1] ?? 1,
    day = fallback?.[2] ?? 1,
    hour = fallback?.[3] ?? 0,
    minute = fallback?.[4] ?? 0,
    second = fallback?.[5] ?? 0,
    ms = fallback?.[6] ?? 0,
  ] = arr
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms))
}

export const formatDateTimeArray = (
  value: DateTimeArray | undefined,
  parts: DateTimeParts = [true, true, true, true, true, true, true],
  fallback = "Select date/time",
): string => {
  if (!value) return fallback

  const [year, month, day, hour, minute, second, ms] = value.map((v, i) =>
    parts[i] ? v : undefined,
  )
  const resultArray: string[] = []

  if (year !== undefined) resultArray.push(year.toString())
  if (month !== undefined)
    resultArray.push(MONTHS[month - 1] ?? month.toString())
  if (day !== undefined) resultArray.push(day.toString())

  const timeArray: string[] = []
  if (hour !== undefined) timeArray.push(hour.toString().padStart(2, "0"))
  if (minute !== undefined) timeArray.push(minute.toString().padStart(2, "0"))
  if (second !== undefined) timeArray.push(second.toString().padStart(2, "0"))

  let timeString = timeArray.join(":")
  if (ms !== undefined) {
    timeString += `.${ms.toString().padStart(3, "0")}`
  }
  resultArray.push(timeString)

  return resultArray.join(" ")
}

export function formatDurationArray(
  value: DateTimeArray | undefined,
  fallback: string = "Select duration",
): string {
  if (!value) return fallback

  const parts: string[] = []

  for (let i = 0; i < value.length; i++) {
    const v = value[i]
    if (v !== undefined && v !== 0) {
      parts.push(`${v}${LABELS[i]}`)
    }
  }

  return parts.length > 0 ? parts.join(" ") : "-"
}
