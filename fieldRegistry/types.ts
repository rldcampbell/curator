import { FieldType, FieldValueMap, RawField, Resolvable } from "@/app/types"

/**
 * FieldDefinition<T>
 *
 * Defines the full behaviour of a single field type (e.g. "text", "number", "date", "boolean").
 * Each field type specifies how it should be displayed, edited, validated, and converted
 * to and from a text-based representation.
 *
 * This architecture gives us:
 * - Centralised, per-type logic for validation, input, and display
 * - Strong typing for field values (via FieldValueMap)
 * - Simplified value conversion using text as a universal intermediary
 * - Consistency across UI components (form inputs, displays, filters)
 * - A robust foundation for features like CSV import/export and AI-driven entry
 *
 * Notes:
 * - `validate` is a type guard to ensure runtime type safety for this field type
 * - `input` is a React component used to render this field in a form input context
 * - `toText` returns a text-based representation of the value for export, display, or comparison
 * - `fromText` parses a text input (e.g. from CSV or user entry) into a typed value, or undefined if invalid
 *
 * By funnelling conversions through text, we eliminate the need for a complex convertTo matrix,
 * simplify import/export logic, and ensure predictable behaviour across dynamic workflows.
 */
export type FieldDefinition<T extends FieldType> = {
  label: string
  defaultValue: FieldValueMap[T]
  validate: (value: unknown) => value is FieldValueMap[T]
  display: (props: { value?: FieldValueMap[T] }) => React.ReactNode
  input: (props: InputProps<T>) => React.ReactNode
  configInput?: (props: ConfigInputProps<T>) => React.ReactNode
  defaultConfig: Extract<RawField, { type: T }>["config"]
  toText: (value: FieldValueMap[T] | undefined) => string | undefined
  fromText: (text: string | undefined) => FieldValueMap[T] | undefined
}

export type ConfigInputProps<T extends FieldType> = {
  config: Extract<RawField, { type: T }>["config"]
  onConfigChange: (newConfig: Extract<RawField, { type: T }>["config"]) => void
}

export type FieldInputChangeHandler<T extends FieldType> = (
  value: Resolvable<FieldValueMap[T] | undefined>,
) => void

export type InputProps<T extends FieldType> = {
  initialValue?: FieldValueMap[T]
  field: Extract<RawField, { type: T }>
  onChange: FieldInputChangeHandler<T>
}
