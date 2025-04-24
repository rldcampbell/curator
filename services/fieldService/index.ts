import {
  FieldType,
  FieldValue,
  FieldValueMap,
  RawFieldAndValue,
} from "@/app/types"
import { fieldRegistry } from "@/fieldRegistry"
import { InputProps } from "@/fieldRegistry/types"

export const fieldService = {
  display<T extends FieldType>({
    type,
    value,
  }: {
    type: T
    value?: FieldValueMap[T]
  }) {
    return fieldRegistry[type].display({ value })
  },

  input<T extends FieldType>(props: InputProps<T>) {
    return fieldRegistry[props.field.type].input(props)
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
