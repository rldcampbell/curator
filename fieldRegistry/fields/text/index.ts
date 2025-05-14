import { Display } from "@/fieldRegistry/fields/text/Display"
import { Input } from "@/fieldRegistry/fields/text/Input"
import { FieldDefinition } from "@/fieldRegistry/types"

const validate = (value: unknown): value is string => typeof value === "string"

export const text: FieldDefinition<"text"> = {
  label: "Text",
  defaultValue: "",
  defaultConfig: {},
  display: Display,
  input: Input,
  validate,
  fromText: text => text || undefined,
  toText: value => value,
} satisfies FieldDefinition<"text">
