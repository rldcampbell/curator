/**
 * Field type registry
 *
 * This file exports a `fieldRegistry` object that maps each `FieldType` value to its corresponding
 * FieldTypeDefinition. Each field type lives in its own file for modularity.
 *
 * Type safety is enforced using a mapped type with `satisfies`, ensuring:
 * - all keys in `FieldType` are present
 * - each value matches `FieldTypeDefinition<K>` where K is the key
 */
import { FieldType } from "@/app/types"

import date from "./date"
import image from "./image"
import number from "./number"
import { text } from "./text"
import { FieldDefinition } from "./types"

export const fieldRegistry = {
  [FieldType.Text]: text,
  [FieldType.Number]: number,
  [FieldType.Date]: date,
  [FieldType.Image]: image,
} as const satisfies {
  [K in FieldType]: FieldDefinition<K>
}
