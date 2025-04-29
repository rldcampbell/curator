import TextFieldInput from "@/components/fieldInputs/TextFieldInput"
import { TextDisplay } from "@/fieldRegistry/display/TextDisplay"
import { FieldDefinition } from "@/fieldRegistry/types"

const validate = (value: unknown): value is string => typeof value === "string"

export const text: FieldDefinition<"text"> = {
  label: "Text",
  defaultValue: "",
  defaultConfig: {},
  display: TextDisplay,
  input: TextFieldInput,
  validate,
  fromText: text => (text === "" ? undefined : text),
  toText: value => value,
} satisfies FieldDefinition<"text">
