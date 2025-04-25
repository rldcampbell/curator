import { FieldType } from "@/app/types"
import NumberFieldInput from "@/components/fieldInputs/NumberFieldInput"
import { NumberDisplay } from "@/fieldRegistry/display/NumberDisplay"
import { FieldDefinition } from "@/fieldRegistry/types"
import { dateToDateArray } from "@/helpers"

const validate = (value: unknown): value is number =>
  typeof value === "number" && !isNaN(value)

const convertTo = (value: number | undefined, target: FieldType): any => {
  if (value === undefined) return undefined

  switch (target) {
    case FieldType.Number:
      return value
    case FieldType.Text:
      return value.toString()
    case FieldType.Date: {
      // TODO: make sure have appropriate date array helpers!
      const date = new Date(value)
      return isNaN(date.getTime()) ? undefined : dateToDateArray(date)
    }
    case FieldType.Image:
      return undefined
  }
}

export const number: FieldDefinition<"number"> = {
  label: "Number",
  defaultValue: 0,
  display: NumberDisplay,
  input: NumberFieldInput,
  validate,
  convertTo,
}
