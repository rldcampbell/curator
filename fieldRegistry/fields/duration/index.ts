import { FieldType, FieldValueMap } from "@/app/types"
import { FieldDefinition } from "@/fieldRegistry/types"
import {
  dateTimeArrayToIsoDuration,
  isoDurationToDateTimeArray,
} from "@/helpers/date"

import { ConfigInput } from "./ConfigInput"
import { Display } from "./Display"
import { Input } from "./Input"

const validate = (value: unknown): value is FieldValueMap["duration"] => {
  return (
    Array.isArray(value) &&
    value.every(v => v === undefined || typeof v === "number")
  )
}

export const duration: FieldDefinition<typeof FieldType.Duration> = {
  label: "Duration",
  defaultValue: [],
  defaultConfig: { parts: [true, true, true, true, true, true, true] },
  validate,
  display: Display,
  input: Input,
  configInput: ConfigInput,
  toText: value => (value ? dateTimeArrayToIsoDuration(value) : undefined),
  fromText: text => (text ? isoDurationToDateTimeArray(text) : undefined),
}
