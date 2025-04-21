import { FieldType } from "@/app/types"
import TextFieldInput from "@/components/FieldInput/TextFieldInput"

import { FieldDefinition } from "../types"
import { TextDisplay } from "./display"

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
