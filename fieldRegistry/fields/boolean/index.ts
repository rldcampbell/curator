import { FieldDefinition } from "@/fieldRegistry/types"

import { Display } from "./Display"
import { Input } from "./Input"

export const boolean: FieldDefinition<"boolean"> = {
  label: "Boolean",
  defaultValue: false,
  defaultConfig: {},
  display: ({ value }) => Display({ value }),
  input: Input,
  validate: (_field, v): v is boolean => typeof v === "boolean",
  fromText: (_field, text) => {
    if (text !== undefined) {
      const normalised = text.trim().toLowerCase()
      if (normalised === "true") return true
      if (normalised === "false") return false
    }
    return undefined
  },
  toText: (_field, value) =>
    value === undefined ? undefined : value ? "true" : "false",
}
