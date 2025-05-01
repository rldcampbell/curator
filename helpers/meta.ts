import isEqual from "lodash/isEqual"

import {
  Collection,
  FieldId,
  RawCollection,
  RawField,
  Timestamp,
  WithMeta,
} from "@/app/types"
import { timestampNow } from "@/helpers/date"

export const withMeta = <T>(
  obj: T,
  timestamp = timestampNow(),
): WithMeta<T> => {
  return {
    ...obj,
    _meta: {
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}

export const touchMeta = <T>(
  entity: WithMeta<T>,
  timestamp = timestampNow(),
): WithMeta<T> => ({
  ...entity,
  _meta: {
    ...entity._meta,
    updatedAt: timestamp,
  },
})

export const stripMeta = <T>(entity: WithMeta<T>): T => {
  const { _meta, ...rest } = entity
  return rest as T
}

const assertFieldTypesUnchanged = (
  existingFields: Record<FieldId, RawField>,
  updatedFields: Record<FieldId, RawField>,
) => {
  for (const fieldId of Object.keys(existingFields)) {
    const original = existingFields[fieldId as FieldId]
    const replacement = updatedFields[fieldId as FieldId]
    if (replacement && replacement.type !== original.type) {
      throw new Error(
        `Field type change not allowed: ${fieldId} (${original.type} → ${replacement.type})`,
      )
    }
  }
}

// Merge raw fields with existing meta, touching updatedAt only when changed
const mergeWithMeta = <Id extends string, T>(
  existing: Record<Id, WithMeta<T>>,
  incoming: Record<Id, T>,
  timestamp: Timestamp,
): { merged: Record<Id, WithMeta<T>>; changed: boolean } => {
  const result = {} as Record<Id, WithMeta<T>>
  let changed = false

  for (const [id, newVal] of Object.entries(incoming) as [Id, T][]) {
    const prev = existing[id]
    if (!prev) {
      result[id] = withMeta(newVal, timestamp)
      changed = true
    } else if (!isEqual(prev, newVal)) {
      result[id] = touchMeta({ ...newVal, _meta: prev._meta }, timestamp)
      changed = true
    } else {
      result[id] = prev
    }
  }

  return { merged: result, changed }
}

export const patchCollection = (
  existing: Collection,
  patch: Partial<
    Pick<RawCollection, "name" | "color" | "fieldOrder" | "fields">
  >,
  options?: { strictFieldTypes?: boolean; timestamp?: Timestamp },
): Collection | null => {
  const timestamp = options?.timestamp ?? timestampNow()

  // Strict field type check (optional)
  if (options?.strictFieldTypes && patch.fields) {
    assertFieldTypesUnchanged(existing.fields, patch.fields)
  }

  // Top-level values
  const name = patch.name ?? existing.name
  const color = "color" in patch ? patch.color : existing.color
  const fieldOrder = patch.fieldOrder ?? existing.fieldOrder

  // Field merging
  let fieldsChanged = false
  let mergedFields = existing.fields

  if (patch.fields) {
    // Merge values and detect changes
    const { merged, changed } = mergeWithMeta(
      existing.fields,
      patch.fields,
      timestamp,
    )
    mergedFields = merged
    fieldsChanged = changed

    // Remove any deleted fields
    // Note: we don't bother tidying up items - db will do so, and removed fields
    // won't be displayed.
    const deletedFieldIds = Object.keys(existing.fields).filter(
      id => !(id in patch.fields!),
    )

    if (deletedFieldIds.length > 0) {
      for (const fieldId of deletedFieldIds) {
        delete mergedFields[fieldId as FieldId]
      }
      fieldsChanged = true
    }
  }

  // Determine if anything changed
  const changed =
    name !== existing.name ||
    color !== existing.color ||
    (patch.fieldOrder && !isEqual(fieldOrder, existing.fieldOrder)) ||
    fieldsChanged

  if (!changed) return null

  // Return patched collection
  return {
    ...existing,
    name,
    color,
    fieldOrder,
    fields: mergedFields,
    _meta: {
      ...existing._meta,
      updatedAt: timestamp,
    },
  }
}
