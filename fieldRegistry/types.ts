import { FieldType, FieldValueMap } from "@/app/types"
import { FieldInputProps } from "@/components/FieldInput/types"

/**
 * FieldDefinition<T>
 *
 * Defines the full behavior of a single field type (e.g. "text", "number", "date").
 * Each field type defines how it should be displayed, edited, validated, and converted
 * to other field types.
 *
 * This architecture gives us:
 * - Centralized logic per field type
 * - Strong typing for field values and cross-type conversions
 * - Reusability across forms, display views, filtering, and more
 * - Consistent UI by linking each field to its own input component
 * - A foundation for future extensibility (e.g. export rules, formatting options)
 *
 * Notes:
 * - `validate` is a type guard to ensure runtime type safety
 * - `input` is a React component used to render this field in form inputs
 */
export type FieldDefinition<T extends FieldType> = {
  label: string
  defaultValue: FieldValueMap[T]
  display: React.FC<{ value?: FieldValueMap[T] }>
  input: React.FC<FieldInputProps<T>>
  validate: (value: unknown) => value is FieldValueMap[T]
  convertTo: <U extends FieldType>(
    value: FieldValueMap[T] | undefined,
    target: U,
  ) => FieldValueMap[U] | undefined
}
