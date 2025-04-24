import { FieldType } from "@/app/types"
import TextFieldInput from "@/components/fieldInputs/TextFieldInput"
import { TextDisplay } from "@/fieldRegistry/display/TextDisplay"
import { FieldDefinition } from "@/fieldRegistry/types"

const validate = (value: unknown): value is string => typeof value === "string"

const convertTo = (value: string | undefined, target: FieldType): any => {
  if (value === undefined) return undefined

  switch (target) {
    case FieldType.Text:
      return value
    case FieldType.Number: {
      const num = parseFloat(value)
      return isNaN(num) ? undefined : num
    }
    case FieldType.Date: {
      // TODO: make sure have appropriate date array helpers - and use them!
      const date = new Date(value)
      return isNaN(date.getTime())
        ? undefined
        : [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    }
    case FieldType.Image:
      return undefined
  }
}

export const text: FieldDefinition<"text"> = {
  label: "Text",
  defaultValue: "",
  display: TextDisplay,
  input: TextFieldInput,
  validate,
  convertTo,
} satisfies FieldDefinition<"text">
