import { FieldDefinition } from "@/fieldRegistry/types"

import { Display } from "./Display"
import { Input } from "./Input"

const validate = (value: unknown): value is number =>
  typeof value === "number" && !isNaN(value)

export const number: FieldDefinition<"number"> = {
  label: "Number",
  defaultValue: 0,
  defaultConfig: {},
  display: ({ value }) => Display({ value }),
  input: Input,
  validate: (_field, value): value is number => validate(value),
  fromText: (_field, text) => {
    if (text === undefined) return undefined
    const parsed = parseFloat(text)
    return isNaN(parsed) ? undefined : parsed
  },
  toText: (_field, value) => value?.toString(),
}
