import { FieldType, FieldValueMap } from "@/app/types"
import DurationFieldConfigInput from "@/components/fieldConfigInputs/DurationFieldConfigInput"
import DurationFieldInput from "@/components/fieldInputs/DurationFieldInput"
import { DurationDisplay } from "@/fieldRegistry/display/DurationDisplay"
import { FieldDefinition } from "@/fieldRegistry/types"
import {
  dateTimeArrayToIsoDuration,
  isoDurationToDateTimeArray,
} from "@/helpers/date"

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
  display: DurationDisplay,
  input: DurationFieldInput,
  configInput: DurationFieldConfigInput,
  toText: value => (value ? dateTimeArrayToIsoDuration(value) : undefined),
  fromText: text => (text ? isoDurationToDateTimeArray(text) : undefined),
}
