import {
  FieldId,
  FieldType,
  FieldValue,
  FieldValueMap,
  RawFieldAndValue,
} from "@/app/types"
import { fieldRegistry } from "@/fieldRegistry"
import { FieldDefinition, UpdateFn } from "@/fieldRegistry/types"

export const fieldService = {
  display(fieldWithValue: RawFieldAndValue) {
    // Safe cast: field.type ensures the correct display function is selected from the registry,
    // and field satisfies the expected structure for that type (guaranteed by the discriminated union).
    const { type } = fieldWithValue
    type T = typeof type
    const entry = fieldRegistry[type] as FieldDefinition<T>

    return entry.display(fieldWithValue)
  },

  input(fieldWithValue: RawFieldAndValue, fieldId: FieldId, update: UpdateFn) {
    // Safe cast: fieldWithValue.type ensures the correct input component is selected from the registry,
    // and the field object matches the expected input props for that type.
    return (
      fieldRegistry[fieldWithValue.type] as FieldDefinition<
        typeof fieldWithValue.type
      >
    ).input({
      fieldId,
      value: fieldWithValue.value,
      field: fieldWithValue,
      update,
    })
  },

  defaultValue(type: FieldType): FieldValue {
    return fieldRegistry[type].defaultValue
  },

  validate(type: FieldType, value: unknown): boolean {
    const validator = fieldRegistry[type].validate
    return validator ? validator(value) : true
  },

  convertTo<T extends FieldType>(
    fieldWithValue: RawFieldAndValue,
    to: T,
  ): FieldValueMap[T] | undefined {
    // Safe cast: field.type selects the correct convertTo function,
    // and value matches the expected type for that function.
    return fieldRegistry[fieldWithValue.type].convertTo(
      fieldWithValue.value as any,
      to,
    )
  },
}
