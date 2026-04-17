import { DurationArray, FieldType } from "@/types"
import { FieldDefinition } from "@/fieldRegistry/types"
import {
  defaultDurationFieldConfig,
  formatDurationValue,
  parseDurationValue,
  validateDurationValue,
} from "@/helpers/temporal"

import { ConfigInput } from "./ConfigInput"
import { Display } from "./Display"
import { Input } from "./Input"

export const duration: FieldDefinition<typeof FieldType.Duration> = {
  label: "Duration",
  defaultValue: [],
  defaultConfig: defaultDurationFieldConfig,
  validate: (field, value): value is DurationArray =>
    validateDurationValue(field.config, value),
  display: props => Display(props),
  input: Input,
  configInput: ConfigInput,
  toText: (field, value) => formatDurationValue(field.config, value),
  fromText: (field, text) => parseDurationValue(field.config, text),
}
