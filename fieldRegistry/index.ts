/**
 * Field type registry
 *
 * This file exports a `fieldRegistry` object that maps each `FieldType` value to its corresponding
 * FieldDefinition. Each field type lives in its own file for modularity and separation of logic.
 *
 * Type safety is enforced using a mapped type (`[K in FieldType]: FieldDefinition<K>`), ensuring:
 * - All keys in `FieldType` are present
 * - Each value is correctly typed as `FieldDefinition<K>` for its respective key
 *
 * Each field definition includes behavior for:
 * - Rendering values (display)
 * - Rendering inputs (input)
 * - Validation and default values
 * - Type-safe conversion between field types
 */
import { FieldType } from "@/app/types"

import { date } from "./fields/date"
import { image } from "./fields/image"
import { number } from "./fields/number"
import { text } from "./fields/text"
import { FieldDefinition } from "./types"

export const fieldRegistry: {
  [K in FieldType]: FieldDefinition<K>
} = {
  text,
  number,
  date,
  image,
}
