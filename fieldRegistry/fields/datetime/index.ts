import { DateTimeArray, FieldType } from "@/app/types"
import { FieldDefinition } from "@/fieldRegistry/types"
import { safeDateTimeArrayToUTCDate } from "@/helpers/date"

import { ConfigInput } from "./ConfigInput"
import { Display } from "./Display"
import { Input } from "./Input"

const validate = (value: unknown): value is DateTimeArray =>
  Array.isArray(value) &&
  value.length === 7 &&
  value.every(v => typeof v === "number")

export const datetime: FieldDefinition<typeof FieldType.DateTime> = {
  label: "Date/Time",
  defaultValue: [2000, 1, 1, 0, 0, 0, 0], // safe neutral starting point - used in toText!
  defaultConfig: { parts: [true, true, true, true, true, true, true] },
  display: Display,
  input: Input,
  configInput: ConfigInput,
  validate,
  fromText: text => {
    if (!text) return undefined

    try {
      const date = new Date(text.replace(/Z$/, "")) // interpret UTC as local - but use local methods below

      if (isNaN(date.getTime())) {
        return undefined
      }

      return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
      ]
    } catch {
      return undefined
    }
  },
  toText: value => {
    if (!value) return undefined

    const date = safeDateTimeArrayToUTCDate(value, datetime.defaultValue)
    return date.toISOString()
  },
}
