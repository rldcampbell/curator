import { DateArray } from "@/app/types"
import DateFieldInput from "@/components/FieldInput/DateFieldInput"

import { FieldDefinition } from "../types"

const def: FieldDefinition<"date"> = {
  label: "Date",
  defaultValue: [2000, 1, 1],
  display: ({}) => null,
  input: DateFieldInput,
  validate: (value: unknown): value is DateArray =>
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(v => typeof v === "number"),
  convertTo: () => undefined,
}

export default def
