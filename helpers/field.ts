import { FieldType, RawFieldAndValue } from "@/app/types"

// this to be deprecated in favour of the field type registry?
export function formatFieldValue(field: RawFieldAndValue): string {
  if (!field.value) {
    return ""
  }
  switch (field.type) {
    case FieldType.Text:
      return field.value

    case FieldType.Number:
      return field.value.toString()

    case FieldType.Date:
      const [year, month, day] = field.value
      return `${day.toString().padStart(2, "0")}/${month}/${year}`

    default:
      return ""
  }
}
