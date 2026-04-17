import { Display } from "@/fieldRegistry/fields/text/Display"
import { Input } from "@/fieldRegistry/fields/text/Input"
import { FieldDefinition } from "@/fieldRegistry/types"

const validate = (value: unknown): value is string => typeof value === "string"

export const text: FieldDefinition<"text"> = {
  label: "Text",
  defaultValue: "",
  defaultConfig: {},
  display: ({ value }) => Display({ value }),
  input: Input,
  validate: (_field, value): value is string => validate(value),
  fromText: (_field, text) => text || undefined,
  toText: (_field, value) => value,
} satisfies FieldDefinition<"text">
