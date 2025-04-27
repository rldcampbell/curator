import ImageFieldInput from "@/components/fieldInputs/ImageFieldInput"
import { ImageDisplay } from "@/fieldRegistry/display/ImageDisplay"
import { FieldDefinition } from "@/fieldRegistry/types"

const validate = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(v => typeof v === "string")

export const image: FieldDefinition<"image"> = {
  label: "Image",
  defaultValue: [],
  defaultConfig: {},
  display: ImageDisplay,
  input: ImageFieldInput,
  validate,
  fromText: () => undefined,
  toText: () => undefined,
}
