import {
  FieldType,
  FieldValue,
  FieldValueMap,
  RawFieldAndValue,
} from "@/app/types"
import { fieldRegistry } from "@/fieldRegistry"

export const fieldService = {
  display(field: RawFieldAndValue) {
    // Safe cast: field.type ensures the correct display function is selected from the registry,
    // and field satisfies the expected structure for that type (guaranteed by the discriminated union).
    return fieldRegistry[field.type].display(field as any)
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
