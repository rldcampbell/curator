import { FieldDefinition } from "@/fieldRegistry/types"

import { Display } from "./Display"
import { Input } from "./Input"

const validate = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(v => typeof v === "string")

export const image: FieldDefinition<"image"> = {
  label: "Image",
  defaultValue: [],
  defaultConfig: {},
  display: ({ value }) => Display({ value }),
  input: Input,
  validate: (_field, value): value is string[] => validate(value),
  fromText: () => undefined,
  toText: () => undefined,
}
