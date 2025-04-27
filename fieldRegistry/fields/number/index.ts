import NumberFieldInput from "@/components/fieldInputs/NumberFieldInput"
import { NumberDisplay } from "@/fieldRegistry/display/NumberDisplay"
import { FieldDefinition } from "@/fieldRegistry/types"

const validate = (value: unknown): value is number =>
  typeof value === "number" && !isNaN(value)

export const number: FieldDefinition<"number"> = {
  label: "Number",
  defaultValue: 0,
  defaultConfig: {},
  display: NumberDisplay,
  input: NumberFieldInput,
  validate,
  fromText: text => {
    if (text === undefined) return undefined
    const parsed = parseFloat(text)
    return isNaN(parsed) ? undefined : parsed
  },
  toText: value => value?.toString(),
}
