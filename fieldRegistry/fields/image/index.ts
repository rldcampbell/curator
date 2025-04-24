import { FieldType } from "@/app/types"
import ImageFieldInput from "@/components/fieldInputs/ImageFieldInput"
import { ImageDisplay } from "@/fieldRegistry/display/ImageDisplay"
import { FieldDefinition } from "@/fieldRegistry/types"

const validate = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(v => typeof v === "string")

const convertTo = (_value: string[] | undefined, _target: FieldType): any => {
  return undefined
}

export const image: FieldDefinition<"image"> = {
  label: "Image",
  defaultValue: [],
  display: ImageDisplay,
  input: ImageFieldInput,
  validate,
  convertTo,
}
