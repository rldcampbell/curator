import { DateArray, FieldType } from "@/app/types"
import DateFieldInput from "@/components/FieldInput/DateFieldInput"
import { DateDisplay } from "@/fieldRegistry/display/DateDisplay"
import { FieldDefinition } from "@/fieldRegistry/types"
import { dateArrayToUTCDate, formatDate } from "@/helpers"

const validate = (value: unknown): value is DateArray =>
  Array.isArray(value) &&
  value.length === 3 &&
  value.every(v => typeof v === "number")

const convertTo = (value: DateArray | undefined, target: FieldType): any => {
  if (!value) return undefined
  const date = dateArrayToUTCDate(value)

  switch (target) {
    case FieldType.Date:
      return value
    case FieldType.Text:
      return formatDate(date)
    case FieldType.Number:
      return date.getTime()
    case FieldType.Image:
      return undefined
  }
}

export const date: FieldDefinition<"date"> = {
  label: "Date",
  defaultValue: [2024, 1, 1],
  display: DateDisplay,
  input: DateFieldInput,
  validate,
  convertTo,
}
