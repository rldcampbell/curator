import { FieldDefinition } from "@/fieldRegistry/types"

import { Display } from "./Display"
import { Input } from "./Input"

const validate = (value: unknown): value is number =>
  typeof value === "number" && !isNaN(value)

export const number: FieldDefinition<"number"> = {
  label: "Number",
  defaultValue: 0,
  defaultConfig: {},
  display: Display,
  input: Input,
  validate,
  fromText: text => {
    if (text === undefined) return undefined
    const parsed = parseFloat(text)
    return isNaN(parsed) ? undefined : parsed
  },
  toText: value => value?.toString(),
}
