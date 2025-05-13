import { BooleanDisplay } from "@/fieldRegistry/display/BooleanDisplay"
import { Input } from "@/fieldRegistry/fields/boolean/Input"
import { FieldDefinition } from "@/fieldRegistry/types"

export const boolean: FieldDefinition<"boolean"> = {
  label: "Boolean",
  defaultValue: false,
  defaultConfig: {},
  display: BooleanDisplay,
  input: Input,
  validate: (v): v is boolean => typeof v === "boolean",
  fromText: text => {
    if (text !== undefined) {
      const normalised = text.trim().toLowerCase()
      if (normalised === "true") return true
      if (normalised === "false") return false
    }
    return undefined
  },
  toText: value => (value === undefined ? undefined : value ? "true" : "false"),
}
