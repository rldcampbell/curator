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

export const patchCollection = (
  existing: Collection,
  incoming: Partial<RawCollection>,
  options?: { strictFieldTypes?: boolean; timestamp?: Timestamp },
): Collection => {
  if (options?.strictFieldTypes && incoming.fields) {
    assertFieldTypesUnchanged(existing.fields, incoming.fields)
  }

  const timestamp = options?.timestamp ?? timestampNow()

  // Merge top-level props
  const name = incoming.name ?? existing.name
  const fieldOrder = incoming.fieldOrder ?? existing.fieldOrder
  const itemOrder = incoming.itemOrder ?? existing.itemOrder

  // Merge fields
  const mergedFields = incoming.fields
    ? mergeWithMeta(existing.fields, incoming.fields, timestamp)
    : existing.fields

  // Merge items
  const mergedItems = incoming.items
    ? mergeWithMeta(existing.items, incoming.items, timestamp)
    : existing.items

  // Detect if anything changed
  const changed =
    name !== existing.name ||
    (incoming.fieldOrder && !isEqual(fieldOrder, existing.fieldOrder)) ||
    (incoming.itemOrder && !isEqual(itemOrder, existing.itemOrder)) ||
    (incoming.fields && !isEqual(mergedFields, existing.fields)) ||
    (incoming.items && !isEqual(mergedItems, existing.items))

  return {
    name,
    fieldOrder,
    itemOrder,
    fields: mergedFields,
    items: mergedItems,
    _meta: {
      ...existing._meta,
      updatedAt: changed ? timestamp : existing._meta.updatedAt,
    },
  }
}

const mergeWithMeta = <Id extends string, T>(
  existing: Record<Id, WithMeta<T>>,
  incoming: Record<Id, T>,
  timestamp: Timestamp,
): Record<Id, WithMeta<T>> => {
  const result = {} as Record<Id, WithMeta<T>>

  for (const [id, incomingValue] of Object.entries(incoming) as [Id, T][]) {
    const current = existing[id]
    if (!current) {
      result[id] = withMeta(incomingValue, timestamp)
    } else if (!isEqual(current, incomingValue)) {
      result[id] = touchMeta(
        {
          ...incomingValue,
          _meta: current._meta,
        },
        timestamp,
      )
    } else {
      // Unchanged, keep as-is
      result[id] = current
    }
  }

  return result
}
