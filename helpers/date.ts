import { DateTimeArray } from "@/app/types"

export const timestampNow = () => Date.now()

export const timestampToDate = (ts: number) => new Date(ts)

export function dateTimeArrayToIsoDuration(value: DateTimeArray): string {
  const [year, month, day, hour, minute, second, ms] = value

  let result = "P"
  const dateParts: string[] = []
  const timeParts: string[] = []

  if (year !== undefined) dateParts.push(`${year}Y`)
  if (month !== undefined) dateParts.push(`${month}M`)
  if (day !== undefined) dateParts.push(`${day}D`)

  const hasTime = [hour, minute, second, ms].some(v => v !== undefined)
  if (hasTime) result += dateParts.join("") + "T"
  else result += dateParts.join("")

  if (hour !== undefined) timeParts.push(`${hour}H`)
  if (minute !== undefined) timeParts.push(`${minute}M`)

  if (second !== undefined || ms !== undefined) {
    if (second !== undefined && ms !== undefined) {
      const fractional = (second + ms / 1000).toFixed(3)
      timeParts.push(`${fractional}S`)
    } else if (second !== undefined) {
      timeParts.push(`${second}S`)
    } else if (ms !== undefined) {
      const fractional = (ms / 1000).toFixed(3).slice(1) // slice to keep '.xxx'
      timeParts.push(`${fractional}S`)
    }
  }

  result += timeParts.join("")

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

  const year = match[1] ? parseInt(match[1], 10) : undefined
  const month = match[2] ? parseInt(match[2], 10) : undefined
  const day = match[3] ? parseInt(match[3], 10) : undefined
  const hour = match[4] ? parseInt(match[4], 10) : undefined
  const minute = match[5] ? parseInt(match[5], 10) : undefined

  const secondsAndMilliseconds = match[6]

  let second: number | undefined
  let ms: number | undefined

  if (secondsAndMilliseconds !== undefined) {
    const [secondsPart, millisecondsPart] = secondsAndMilliseconds.split(".")

    if (secondsPart) {
      second = parseInt(secondsPart, 10)
    }

    if (millisecondsPart) {
      ms = parseInt(millisecondsPart.padEnd(3, "0"), 10)
    }
  }

  return [year, month, day, hour, minute, second, ms]
}
