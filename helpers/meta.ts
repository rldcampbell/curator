import isEqual from "lodash/isEqual"

import { Collection, RawCollection, Timestamp, WithMeta } from "@/app/types"
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

export const patchCollectionWithMeta = (
  existing: Collection,
  incoming: Partial<RawCollection>,
): Collection => {
  const now = timestampNow()

  // Merge top-level props
  const name = incoming.name ?? existing.name
  const fieldOrder = incoming.fieldOrder ?? existing.fieldOrder
  const itemOrder = incoming.itemOrder ?? existing.itemOrder

  // Merge fields
  const mergedFields = incoming.fields
    ? mergeWithMeta(existing.fields, incoming.fields, now)
    : existing.fields

  // Merge items
  const mergedItems = incoming.items
    ? mergeWithMeta(existing.items, incoming.items, now)
    : existing.items

  // Detect if anything changed
  const changed =
    name !== existing.name ||
    !isEqual(fieldOrder, existing.fieldOrder) ||
    !isEqual(itemOrder, existing.itemOrder) ||
    !isEqual(mergedFields, existing.fields) ||
    !isEqual(mergedItems, existing.items)

  return {
    name,
    fieldOrder,
    itemOrder,
    fields: mergedFields,
    items: mergedItems,
    _meta: {
      ...existing._meta,
      updatedAt: changed ? now : existing._meta.updatedAt,
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
