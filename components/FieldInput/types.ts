import { FieldId, FieldType, FieldValueMap, RawField } from "@/app/types"

export type FieldInputProps<T extends FieldType> = {
  fieldId: FieldId
  field: Extract<RawField, { type: T }>
  value?: FieldValueMap[T]
  update: (id: FieldId, value: FieldValueMap[T]) => void
}
