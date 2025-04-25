import { FieldType, FieldValue, FieldValueMap } from "@/app/types"
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

  fromText<T extends FieldType>(
    type: T,
    value: string | undefined,
  ): FieldValueMap[T] | undefined {
    return fieldRegistry[type].fromText(value)
  },

  toText<T extends FieldType>(
    type: T,
    value: FieldValueMap[T] | undefined,
  ): string | undefined {
    return fieldRegistry[type].toText(value)
  },
}
