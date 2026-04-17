import { DateTimeArray, FieldType } from "@/types"
import { FieldDefinition } from "@/fieldRegistry/types"
import {
  defaultDateTimeFieldConfig,
  formatDateTimeValue,
  parseDateTimeValue,
  validateDateTimeValue,
} from "@/helpers/temporal"

import { ConfigInput } from "./ConfigInput"
import { Display } from "./Display"
import { Input } from "./Input"

export const datetime: FieldDefinition<typeof FieldType.DateTime> = {
  label: "Date/Time",
  defaultValue: [],
  defaultConfig: defaultDateTimeFieldConfig,
  display: props => Display(props),
  input: Input,
  configInput: ConfigInput,
  validate: (field, value): value is DateTimeArray =>
    validateDateTimeValue(field.config, value),
  fromText: (field, text) => parseDateTimeValue(field.config, text),
  toText: (field, value) => formatDateTimeValue(field.config, value),
}
