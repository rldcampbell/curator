import {
  FieldType,
  FieldValue,
  FieldValueMap,
  RawField,
  RawFieldAndValue,
} from "@/types"
import { fieldRegistry } from "@/fieldRegistry"
import { ConfigInputProps, InputProps } from "@/fieldRegistry/types"

export const fieldService = {
  display<T extends FieldType>(field: Extract<RawFieldAndValue, { type: T }>) {
    return field.value === undefined
      ? fieldRegistry[field.type].display({ field })
      : fieldRegistry[field.type].display({
          field,
          value: field.value as FieldValueMap[T],
        })
  },

  input<T extends FieldType>(props: InputProps<T>) {
    return fieldRegistry[props.field.type].input(props)
  },

  configInput<T extends FieldType>({
    type,
    ...props
  }: { type: T } & ConfigInputProps<T>) {
    return fieldRegistry[type].configInput?.(props) ?? null
  },

  defaultValue(type: FieldType): FieldValue {
    return fieldRegistry[type].defaultValue
  },

  validate<T extends FieldType>(
    field: Extract<RawField, { type: T }>,
    value: unknown,
  ): boolean {
    return fieldRegistry[field.type].validate(field, value)
  },

  fromText<T extends FieldType>(
    field: Extract<RawField, { type: T }>,
    value: string | undefined,
  ): FieldValueMap[T] | undefined {
    return fieldRegistry[field.type].fromText(field, value)
  },

  toText<T extends FieldType>(
    field: Extract<RawField, { type: T }>,
    value: FieldValueMap[T] | undefined,
  ): string | undefined {
    return fieldRegistry[field.type].toText(field, value)
  },

  convert<From extends FieldType, To extends FieldType>(
    fromField: Extract<RawField, { type: From }>,
    toField: Extract<RawField, { type: To }>,
    value: FieldValueMap[From] | undefined,
  ): FieldValueMap[To] | undefined {
    return fieldService.fromText(
      toField,
      fieldService.toText(fromField, value),
    )
  },
}
