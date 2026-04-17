import { FieldType, FieldValueMap } from "@/types"
import { FieldDefinition } from "@/fieldRegistry/types"
import {
  dateTimeArrayToIsoDuration,
  isoDurationToDateTimeArray,
} from "@/helpers/date"
import { defaultDurationFieldConfig } from "@/helpers/temporal"

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
  defaultConfig: defaultDurationFieldConfig,
  validate: (_field, value): value is FieldValueMap["duration"] =>
    validate(value),
  display: props => Display(props),
  input: Input,
  configInput: ConfigInput,
  toText: (_field, value) =>
    value ? dateTimeArrayToIsoDuration(value) : undefined,
  fromText: (_field, text) =>
    text ? isoDurationToDateTimeArray(text) : undefined,
}
