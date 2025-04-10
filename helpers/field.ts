import { FieldType, RawFieldAndValue } from "@/app/types"

export function formatFieldValue(field: RawFieldAndValue): string {
  switch (field.type) {
    case FieldType.Text:
      return field.value // string

    case FieldType.Number:
      return field.value.toString()

    case FieldType.Date:
      const [year, month, day] = field.value
      return `${day.toString().padStart(2, "0")}/${month}/${year}`

    default:
      return ""
  }
}
