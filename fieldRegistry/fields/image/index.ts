import { FieldDefinition } from "@/fieldRegistry/types"

import { Display } from "./Display"
import { Input } from "./Input"

const validate = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(v => typeof v === "string")

export const image: FieldDefinition<"image"> = {
  label: "Image",
  defaultValue: [],
  defaultConfig: {},
  display: Display,
  input: Input,
  validate,
  fromText: () => undefined,
  toText: () => undefined,
}
