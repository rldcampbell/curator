import { DateTimeArray } from "@/app/types"

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
    /^P(?:([\d]+)Y)?(?:([\d]+)M)?(?:([\d]+)D)?(?:T(?:([\d]+)H)?(?:([\d]+)M)?(?:([\d]*(?:\.\d+)?)S)?)?$/

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

    if (sPart) {
      s = parseInt(sPart, 10)
    }

    if (msPart) {
      ms = parseInt(msPart.padEnd(3, "0"), 10)
    }
  }

  return [y, m, d, h, min, s, ms]
}
