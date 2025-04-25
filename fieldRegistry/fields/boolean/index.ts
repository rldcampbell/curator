import BooleanFieldInput from "@/components/fieldInputs/BooleanFieldInput"
import { BooleanDisplay } from "@/fieldRegistry/display/BooleanDisplay"
import { FieldDefinition } from "@/fieldRegistry/types"

export const boolean: FieldDefinition<"boolean"> = {
  label: "Boolean",
  defaultValue: false,
  display: BooleanDisplay,
  input: BooleanFieldInput,
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
