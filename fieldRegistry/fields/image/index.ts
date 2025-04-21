import ImageFieldInput from "@/components/FieldInput/ImageFieldInput"

import { FieldDefinition } from "../../types"

const def: FieldDefinition<"image"> = {
  label: "Image",
  defaultValue: [],
  display: ({}) => null,
  input: ImageFieldInput,
  validate: (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(v => typeof v === "string"),
  convertTo: () => undefined,
}

export default def
