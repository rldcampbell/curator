// TODO (2025-04-13):
// Items are currently stored inside the `collections` table as JSON.
// In future, we should normalize this by moving items to a separate `items` table,
// with each item having its own row. This would:
// - Improve scalability for large item sets
// - Allow more granular queries / updates
// - Prepare for future online sync & conflict resolution
// This will require updating:
// - saveCollection/loadCollections logic to use `items` table
// - migrations to support the new schema
import * as FileSystem from "expo-file-system"
import * as SQLite from "expo-sqlite"
import * as Updates from "expo-updates"

import {
  Collection,
  CollectionId,
  CollectionsData,
  Field,
  FieldId,
  FieldType,
  Item,
  ItemId,
  RawCollection,
  RawField,
  RawItem,
} from "@/app/types"
import { fieldRegistry } from "@/fieldRegistry"
import { HexColor } from "@/helpers/color"
import { timestampNow } from "@/helpers/date"

import { migrateDatabase } from "./migrations/runMigrations"

const isDev = __DEV__
const log = (...args: any[]) => {
  if (isDev) console.log("[DB]", ...args)
}

const stringify = JSON.stringify
const parse = JSON.parse

let db: SQLite.SQLiteDatabase | null = null

export const initDatabase = async (): Promise<{ isFreshDb: boolean }> => {
  const path = `${FileSystem.documentDirectory}SQLite/curator.db`

  const info = await FileSystem.getInfoAsync(path)
  const isFreshDb = !info.exists
  console.log("[DB] SQLite file exists on init?", !isFreshDb, "at:", path)

  db = await SQLite.openDatabaseAsync("curator.db")

  await db.execAsync(`PRAGMA journal_mode = WAL;`)
  await migrateDatabase(db)

  const versionRow = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM meta WHERE key = 'db_version'",
  )
  log("DB schema version:", versionRow?.value)

  const existingOrder = await db.getFirstAsync(
    `SELECT id FROM collections WHERE id = ?`,
    "__order__",
  )

  if (!existingOrder) {
    log("Fresh DB detected — inserting __order__ row")
    await db.runAsync(
      `INSERT INTO collections (
        id, name, field_order, fields, item_order, items, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      "__order__",
      "Collection Order",
      "[]",
      "{}",
      "[]",
      "[]",
      timestampNow(),
      timestampNow(),
    )
  } else {
    log("DB already initialized — skipping __order__ insert")
  }

  log("Database initialized")

  return { isFreshDb }
}

// NEW addCollection:
export const addCollection = async (
  collectionId: CollectionId,
  rawCollection: Omit<RawCollection, "itemOrder" | "items">,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Adding new collection:", collectionId)

  const { name, color, fieldOrder, fields } = rawCollection

  const now = timestampNow()

  await db.execAsync("BEGIN")

  try {
    // 1. Find max sortOrder
    const row = await db.getFirstAsync<{ max: number }>(
      `SELECT MAX(sortOrder) as max FROM collections`,
    )
    const nextSortOrder = (row?.max ?? -1) + 1

    // 2. Insert collection metadata
    await db.runAsync(
      `
      INSERT INTO collections (
        id, name, color, sortOrder, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      collectionId,
      name,
      color ?? null,
      nextSortOrder,
      now, // createdAt
      now, // updatedAt
    )

    // 3. Insert fields
    for (const [sortOrder, fieldId] of fieldOrder.entries()) {
      const rawField = fields[fieldId]
      await db.runAsync(
        `
        INSERT INTO fields (
          id, collectionId, name, type, config, sortOrder, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        fieldId,
        collectionId,
        rawField.name,
        rawField.type,
        JSON.stringify(rawField.config),
        sortOrder,
        now,
        now,
      )
    }

    await db.execAsync("COMMIT")
    console.log("[DB] Collection added:", collectionId)
  } catch (error) {
    console.error("[DB] Error adding collection:", error)
    await db.execAsync("ROLLBACK")
    throw error
  }
}

// NEW updateCollection:
export const updateCollection = async (
  collectionId: CollectionId,
  patch: Partial<Pick<Collection, "name" | "color">>,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Updating collection:", collectionId)

  if (!("name" in patch) && !("color" in patch)) {
    console.log("[DB] No changes provided, skipping update for:", collectionId)
    return
  }

  // Check the collection exists
  const row = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM collections WHERE id = ?`,
    collectionId,
  )

  if (!row) {
    console.warn("[DB] Tried to update non-existent collection:", collectionId)
    return
  }

  const now = timestampNow()

  await db.execAsync("BEGIN")
  try {
    const updates: string[] = []
    const values: any[] = []

    if ("name" in patch) {
      updates.push("name = ?")
      values.push(patch.name)
    }

    if ("color" in patch) {
      updates.push("color = ?")
      values.push(patch.color ?? null)
    }

    updates.push("updatedAt = ?")
    values.push(now)

    values.push(collectionId)

    await db.runAsync(
      `UPDATE collections SET ${updates.join(", ")} WHERE id = ?`,
      ...values,
    )

    await db.execAsync("COMMIT")
    console.log("[DB] Collection updated:", collectionId)
  } catch (err) {
    console.error("[DB] Error updating collection:", err)
    await db.execAsync("ROLLBACK")
    throw err
  }
}

const upsertCollection = async (
  id: CollectionId,
  collection: Collection,
): Promise<void> => {
  console.log("[DB] Upsert collection:", id)

  if (!db) throw new Error("Database not initialized")

  const {
    name,
    fieldOrder,
    fields,
    itemOrder,
    items,
    _meta: { createdAt, updatedAt },
  } = collection

  await db.runAsync(
    `INSERT OR REPLACE INTO collections (
  id, name, field_order, fields, item_order, items, color, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
    id,
    name,
    stringify(fieldOrder),
    stringify(fields),
    stringify(itemOrder),
    stringify(items),
    collection.color ?? null,
    createdAt,
    updatedAt ?? null,
  )
}

// NEW loadCollections:
export const loadCollections = async (): Promise<CollectionsData> => {
  if (!db) throw new Error("Database not initialized")

  // Load collections
  const collectionRows = await db.getAllAsync<{
    id: CollectionId
    name: string
    color: HexColor | null
    sortOrder: number
    createdAt: number
    updatedAt: number
  }>(`
    SELECT * FROM collections
    ORDER BY sortOrder ASC
  `)

  // Load fields
  const fieldRows = await db.getAllAsync<{
    id: FieldId
    collectionId: CollectionId
    name: string
    type: string
    config: string
    sortOrder: number
    createdAt: number
    updatedAt: number
  }>(`
    SELECT * FROM fields
    ORDER BY sortOrder ASC
  `)

  // Load items
  const itemRows = await db.getAllAsync<{
    id: ItemId
    collectionId: CollectionId
    tags: string | null
    sortOrder: number
    createdAt: number
    updatedAt: number
  }>(`
    SELECT * FROM items
    ORDER BY sortOrder ASC
  `)

  // Load item_values
  const valueRows = await db.getAllAsync<{
    itemId: ItemId
    fieldId: FieldId
    value: string | null
    createdAt: number
    updatedAt: number
  }>(`
    SELECT * FROM item_values
  `)

  // --- Organize fields ---
  const fieldsByCollection: Record<
    CollectionId,
    { fieldOrder: FieldId[]; fields: Record<FieldId, Field> }
  > = {}

  for (const field of fieldRows) {
    if (!fieldsByCollection[field.collectionId]) {
      fieldsByCollection[field.collectionId] = { fieldOrder: [], fields: {} }
    }
    fieldsByCollection[field.collectionId].fieldOrder.push(field.id)
    fieldsByCollection[field.collectionId].fields[field.id] = {
      name: field.name,
      type: field.type as FieldType,
      config: JSON.parse(field.config),
      _meta: {
        createdAt: field.createdAt,
        updatedAt: field.updatedAt,
      },
    }
  }

  // --- Organize items ---
  const itemsByCollection: Record<
    CollectionId,
    { itemOrder: ItemId[]; items: Record<ItemId, Item> }
  > = {}

  const collectionIdByItemId: Record<ItemId, CollectionId> = {}

  for (const item of itemRows) {
    collectionIdByItemId[item.id] = item.collectionId
    if (!itemsByCollection[item.collectionId]) {
      itemsByCollection[item.collectionId] = { itemOrder: [], items: {} }
    }
    itemsByCollection[item.collectionId].itemOrder.push(item.id)
    itemsByCollection[item.collectionId].items[item.id] = {
      tags: item.tags ? JSON.parse(item.tags) : [],
      values: {},
      _meta: {
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    }
  }

  // --- Apply item_values ---
  for (const valueRow of valueRows) {
    const item: Item | undefined =
      itemsByCollection[collectionIdByItemId[valueRow.itemId]]?.items?.[
        valueRow.itemId
      ]
    if (item && valueRow.value !== null) {
      let parsed = JSON.parse(valueRow.value)
      if (Array.isArray(parsed)) {
        // null -> undefined in arrays for now
        parsed = parsed.map(v => v ?? undefined)
      }
      item.values[valueRow.fieldId] = parsed
    }
  }

  // --- Assemble collections ---
  const collections: Record<CollectionId, Collection> = {}
  const collectionOrder: CollectionId[] = []

  for (const row of collectionRows) {
    collections[row.id] = {
      name: row.name,
      color: row.color ?? undefined,
      fieldOrder: fieldsByCollection[row.id]?.fieldOrder ?? [],
      fields: fieldsByCollection[row.id]?.fields ?? {},
      itemOrder: itemsByCollection[row.id]?.itemOrder ?? [],
      items: itemsByCollection[row.id]?.items ?? {},
      _meta: {
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    }
    collectionOrder.push(row.id)
  }

  console.log("[DB] Loaded collections + fields + items + values")

  return { collections, collectionOrder }
}

export const saveCollection = async (
  id: CollectionId,
  collection: Collection,
  isNew: boolean = false,
): Promise<void> => {
  console.log("[DB] Saving collection:", id)

  await upsertCollection(id, collection)

  if (isNew) {
    const existingOrder = await loadCollectionOrder()
    await saveCollectionOrder([...existingOrder, id])
  }

  log(`Collection ${isNew ? "created" : "updated"}:`, id)
}

const loadCollectionOrder = async (): Promise<CollectionId[]> => {
  if (!db) throw new Error("Database not initialized")

  const row = (await db.getFirstAsync(
    `SELECT items FROM collections WHERE id = ?`,
    "__order__",
  )) as { items: string }
  return parse(row.items)
}

// NEW touchCollection:
const touchCollection = async (
  collectionId: CollectionId,
  timestamp?: number,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  await db.runAsync(
    `
    UPDATE collections
    SET updatedAt = ?
    WHERE id = ?
    `,
    timestamp ?? timestampNow(),
    collectionId,
  )

  console.log("[DB] Touched collection:", collectionId)
}

export const saveCollectionOrder = async (
  order: CollectionId[],
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log(`[DB] persisting collectionOrder: ${order}`)

  await db.runAsync(
    `UPDATE collections SET items = ? WHERE id = ?`,
    stringify(order),
    "__order__",
  )

  log("Collection order saved")
}

export const deleteCollection = async (id: CollectionId): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  await db.runAsync("DELETE FROM collections WHERE id = ?", id)

  const existingOrder = await loadCollectionOrder()
  const updatedOrder = existingOrder.filter(cid => cid !== id)

  await saveCollectionOrder(updatedOrder)

  log("Collection deleted and order updated:", id)
}

// NEW updateCollectionOrder:
export const updateCollectionOrder = async (
  collectionOrder: CollectionId[],
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Updating collection sort order")

  await db.execAsync("BEGIN")
  try {
    for (const [index, collectionId] of collectionOrder.entries()) {
      await db.runAsync(
        `
        UPDATE collections
        SET sortOrder = ?
        WHERE id = ?
        `,
        index,
        collectionId,
      )
    }

    await db.execAsync("COMMIT")
    console.log("[DB] Collection order updated")
  } catch (err) {
    console.error("[DB] Error updating collection order:", err)
    await db.execAsync("ROLLBACK")
    throw err
  }
}

// -- FIELDS --

// NEW addField:
export const addField = async (
  collectionId: CollectionId,
  fieldId: FieldId,
  rawField: RawField,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Adding field:", fieldId, "to collection:", collectionId)

  const now = timestampNow()

  await db.execAsync("BEGIN")
  try {
    // 1. Find max sortOrder for fields in this collection
    const row = await db.getFirstAsync<{ max: number }>(
      `SELECT MAX(sortOrder) as max FROM fields WHERE collectionId = ?`,
      collectionId,
    )
    const nextSortOrder = (row?.max ?? -1) + 1

    // 2. Insert field
    await db.runAsync(
      `
      INSERT INTO fields (
        id, collectionId, name, type, config, sortOrder, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      fieldId,
      collectionId,
      rawField.name,
      rawField.type,
      JSON.stringify(rawField.config),
      nextSortOrder,
      now,
      now,
    )

    await touchCollection(collectionId, now)

    await db.execAsync("COMMIT")
    console.log("[DB] Field added:", fieldId)
  } catch (err) {
    console.error("[DB] Error adding field:", err)
    await db.execAsync("ROLLBACK")
    throw err
  }
}

// NEW updateField:
export const updateField = async (
  fieldId: FieldId,
  patch: Partial<Pick<RawField, "name">>,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Updating field:", fieldId)

  if (patch.name === undefined) {
    console.log(
      "[DB] No supported changes provided, skipping update for:",
      fieldId,
    )
    return
  }

  // Load collectionId for this field
  const fieldRow = await db.getFirstAsync<{ collectionId: CollectionId }>(
    `SELECT collectionId FROM fields WHERE id = ?`,
    fieldId,
  )

  if (!fieldRow) {
    console.warn("[DB] Tried to update non-existent field:", fieldId)
    return
  }

  const { collectionId } = fieldRow
  const now = timestampNow()

  await db.execAsync("BEGIN")
  try {
    await db.runAsync(
      `
      UPDATE fields
      SET name = ?, updatedAt = ?
      WHERE id = ?
      `,
      patch.name,
      now,
      fieldId,
    )

    await touchCollection(collectionId, now)

    await db.execAsync("COMMIT")
    console.log("[DB] Field updated:", fieldId)
  } catch (err) {
    console.error("[DB] Error updating field:", err)
    await db.execAsync("ROLLBACK")
    throw err
  }
}

// NEW deleteField:
export const deleteField = async (fieldId: FieldId): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Deleting field:", fieldId)

  // 1. Load collectionId for this field
  const row = await db.getFirstAsync<{ collectionId: CollectionId }>(
    `SELECT collectionId FROM fields WHERE id = ?`,
    fieldId,
  )

  if (!row) {
    console.warn("[DB] Tried to delete non-existent field:", fieldId)
    return
  }

  const { collectionId } = row

  await db.execAsync("BEGIN")
  try {
    // 2. Delete field
    await db.runAsync(
      `
      DELETE FROM fields WHERE id = ?
      `,
      fieldId,
    )

    // 3. Bump updatedAt on parent collection
    await touchCollection(collectionId)

    await db.execAsync("COMMIT")

    console.log("[DB] Field deleted:", fieldId)
  } catch (err) {
    console.error("[DB] Error deleting field:", err)
    await db.execAsync("ROLLBACK")
    throw err
  }
}

// NEW updateFieldOrder:
export const updateFieldOrder = async (
  collectionId: CollectionId,
  fieldOrder: FieldId[],
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Updating field sort order for collection:", collectionId)

  await db.execAsync("BEGIN")
  try {
    for (const [index, fieldId] of fieldOrder.entries()) {
      await db.runAsync(
        `
        UPDATE fields
        SET sortOrder = ?
        WHERE id = ? AND collectionId = ?
        `,
        index,
        fieldId,
        collectionId,
      )
    }

    await db.execAsync("COMMIT")
    console.log("[DB] Field order updated for collection:", collectionId)
  } catch (err) {
    console.error(
      "[DB] Error updating field order for collection:",
      collectionId,
      err,
    )
    await db.execAsync("ROLLBACK")
    throw err
  }
}

// -- ITEMS --

// NEW addItem:
export const addItem = async (
  collectionId: CollectionId,
  itemId: ItemId,
  item: RawItem,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Adding item:", itemId, "to collection:", collectionId)

  const now = timestampNow()

  const tagString = item.tags ? JSON.stringify(item.tags) : null

  // 1. Compute next sortOrder in collection
  const row = await db.getFirstAsync<{ max: number }>(
    `SELECT MAX(sortOrder) as max FROM items WHERE collectionId = ?`,
    collectionId,
  )
  const nextSortOrder = (row?.max ?? -1) + 1

  await db.execAsync("BEGIN")
  try {
    // 2. Insert item metadata
    await db.runAsync(
      `
      INSERT INTO items (
        id, collectionId, tags, sortOrder, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      itemId,
      collectionId,
      tagString,
      nextSortOrder,
      now,
      now,
    )

    // 3. Insert each value
    for (const [fieldId, value] of Object.entries(item.values)) {
      await db.runAsync(
        `
        INSERT INTO item_values (
          itemId, fieldId, value
        ) VALUES (?, ?, ?)
        `,
        itemId,
        fieldId,
        JSON.stringify(value),
      )
    }

    await touchCollection(collectionId, now)

    await db.execAsync("COMMIT")
    console.log("[DB] Item added:", itemId)
  } catch (err) {
    console.error("[DB] Error adding item:", err)
    await db.execAsync("ROLLBACK")
    throw err
  }
}

// NEW updateItem:
export const updateItem = async (
  itemId: ItemId,
  patch: Partial<RawItem>,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Updating item:", itemId)

  const hasTags = "tags" in patch
  const hasValues = "values" in patch

  if (!hasTags && !hasValues) {
    console.log("[DB] No changes provided, skipping update for:", itemId)
    return
  }

  // 1. Load collectionId for this item
  const itemRow = await db.getFirstAsync<{ collectionId: CollectionId }>(
    `SELECT collectionId FROM items WHERE id = ?`,
    itemId,
  )

  if (!itemRow) {
    console.warn("[DB] Tried to update non-existent item:", itemId)
    return
  }

  const { collectionId } = itemRow
  const now = timestampNow()

  await db.execAsync("BEGIN")
  try {
    // === Update values if present ===
    if (hasValues && patch.values) {
      const existingRows = await db.getAllAsync<{ fieldId: FieldId }>(
        `
        SELECT fieldId FROM item_values
        WHERE itemId = ?
        `,
        itemId,
      )
      const existingFieldIds = new Set(existingRows.map(row => row.fieldId))

      // Delete removed fields
      for (const fieldId of existingFieldIds) {
        if (patch.values[fieldId] === undefined) {
          await db.runAsync(
            `DELETE FROM item_values WHERE itemId = ? AND fieldId = ?`,
            itemId,
            fieldId,
          )
        }
      }

      // Upsert current fields
      for (const [fieldId, value] of Object.entries(patch.values)) {
        await db.runAsync(
          `
          INSERT OR REPLACE INTO item_values (
            itemId, fieldId, value
          ) VALUES (?, ?, ?)
          `,
          itemId,
          fieldId,
          JSON.stringify(value),
        )
      }
    }

    // === Update tags if present ===
    if (hasTags) {
      await db.runAsync(
        `
        UPDATE items
        SET tags = ?, updatedAt = ?
        WHERE id = ?
        `,
        patch.tags ? JSON.stringify(patch.tags) : null,
        now,
        itemId,
      )
    }

    // === Update collection's updatedAt ===
    await touchCollection(collectionId, now)

    await db.execAsync("COMMIT")
    console.log("[DB] Item updated:", itemId, "(changes saved)")
  } catch (err) {
    console.error("[DB] Error updating item:", err)
    await db.execAsync("ROLLBACK")
    throw err
  }
}

// NEW deleteItem:
export const deleteItem = async (itemId: ItemId): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Deleting item:", itemId)

  // 1. Look up collectionId for this item
  const row = await db.getFirstAsync<{ collectionId: CollectionId }>(
    `SELECT collectionId FROM items WHERE id = ?`,
    itemId,
  )

  if (!row) {
    console.warn("[DB] Tried to delete non-existent item:", itemId)
    return
  }

  const { collectionId } = row

  await db.execAsync("BEGIN")
  try {
    // 2. Delete item (cascades to item_values)
    await db.runAsync(
      `
      DELETE FROM items WHERE id = ?
      `,
      itemId,
    )

    // 3. Touch parent collection
    await touchCollection(collectionId)

    await db.execAsync("COMMIT")
    console.log("[DB] Item deleted:", itemId)
  } catch (err) {
    console.error("[DB] Error deleting item:", err)
    await db.execAsync("ROLLBACK")
    throw err
  }
}

export const resetDatabase = async (): Promise<void> => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/curator.db`
  console.log("[RESET] Deleting SQLite database at:", dbPath)

  await FileSystem.deleteAsync(dbPath, { idempotent: true })
  console.log("[RESET] Database file deleted")

  console.log(
    "[RESET] Reloading app to re-initialize DB and trigger seeding...",
  )
  await Updates.reloadAsync()
}

export function normalizeField(field: any): RawField {
  const registryEntry = fieldRegistry[field.type as FieldType]
  if (!registryEntry) {
    console.warn(`Unknown field type: ${field.type}`)
    return field as RawField
  }
  return {
    ...field,
    config: {
      ...registryEntry.defaultConfig,
      ...field.config,
    },
  }
}
