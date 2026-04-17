import { DateTimeArray, FieldType } from "@/types"
import { FieldDefinition } from "@/fieldRegistry/types"
import { defaultDateTimeFieldConfig } from "@/helpers/temporal"
import { safeDateTimeArrayToUTCDate } from "@/helpers/date"

import { ConfigInput } from "./ConfigInput"
import { Display } from "./Display"
import { Input } from "./Input"

const validate = (value: unknown): value is DateTimeArray =>
  Array.isArray(value) &&
  value.every(v => v === undefined || typeof v === "number")

export const datetime: FieldDefinition<typeof FieldType.DateTime> = {
  label: "Date/Time",
  defaultValue: [2000, 1, 1, 0, 0, 0, 0], // safe neutral starting point - used in toText!
  defaultConfig: defaultDateTimeFieldConfig,
  display: props => Display(props),
  input: Input,
  configInput: ConfigInput,
  validate: (_field, value): value is DateTimeArray => validate(value),
  fromText: (_field, text) => {
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
  toText: (_field, value) => {
    if (!value) return undefined

    const date = safeDateTimeArrayToUTCDate(value, datetime.defaultValue)
    return date.toISOString()
  },
}
