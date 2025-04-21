import NumberFieldInput from "@/components/FieldInput/NumberFieldInput"

import { FieldDefinition } from "../types"

const def: FieldDefinition<"number"> = {
  label: "Number",
  defaultValue: 0,
  display: ({}) => null,
  input: NumberFieldInput,
  validate: (value: unknown): value is number => typeof value === "number",
  convertTo: () => undefined,
}

export default def
