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
  RawItem,
} from "@/app/types"
import { HexColor } from "@/helpers/color"
import { timestampNow } from "@/helpers/date"

import { migrateDatabase } from "./migrations/runMigrations"

const isDev = __DEV__
const log = (...args: any[]) => {
  if (isDev) console.log("[DB]", ...args)
}

let db: SQLite.SQLiteDatabase | null = null

// NEW initDatabase:
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

// NEW deleteCollection:
export const deleteCollection = async (
  collectionId: CollectionId,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Deleting collection:", collectionId)

  await db.execAsync("BEGIN")
  try {
    await db.runAsync(`DELETE FROM collections WHERE id = ?`, collectionId)

    await db.execAsync("COMMIT")
    console.log("[DB] Collection deleted:", collectionId)
  } catch (err) {
    console.error("[DB] Error deleting collection:", collectionId, err)
    await db.execAsync("ROLLBACK")
    throw err
  }
}

// NEW editCollectionStructure
export const updateCollection = async (
  collectionId: CollectionId,
  update: Partial<
    Pick<RawCollection, "name" | "color" | "fieldOrder" | "fields">
  >,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Editing collection structure:", collectionId)

  const now = timestampNow()

  await db.execAsync("BEGIN")
  try {
    // 1. Update name/color if provided
    if ("name" in update || "color" in update) {
      const updates: string[] = []
      const values: any[] = []

      if ("name" in update) {
        updates.push("name = ?")
        values.push(update.name)
      }

      if ("color" in update) {
        updates.push("color = ?")
        values.push(update.color ?? null)
      }

      updates.push("updatedAt = ?")
      values.push(now)
      values.push(collectionId)

      await db.runAsync(
        `UPDATE collections SET ${updates.join(", ")} WHERE id = ?`,
        ...values,
      )
    }

    // 2. Handle field diffs if fields object is provided
    if ("fields" in update) {
      const newFields = update.fields!
      const newFieldIds = new Set(Object.keys(newFields))

      const existingRows = await db.getAllAsync<{
        id: FieldId
        name: string
      }>(
        `
        SELECT id, name FROM fields
        WHERE collectionId = ?
        `,
        collectionId,
      )

      const existingFieldIds = new Set(existingRows.map(f => f.id))
      const existingNameMap = Object.fromEntries(
        existingRows.map(f => [f.id, f.name]),
      )

      // 2a. Delete fields that are missing
      for (const fieldId of existingFieldIds) {
        if (!newFieldIds.has(fieldId)) {
          await db.runAsync(`DELETE FROM fields WHERE id = ?`, fieldId)
        }
      }

      // 2b. Add or update fields
      for (const [fieldId, rawField] of Object.entries(newFields)) {
        if (!existingFieldIds.has(fieldId as FieldId)) {
          // Insert new field
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
            update.fieldOrder?.indexOf(fieldId as FieldId) ?? 0,
            now,
            now,
          )
        } else {
          // Update name if changed (we don't allow config / type updates yet)
          if (rawField.name !== existingNameMap[fieldId]) {
            await db.runAsync(
              `
              UPDATE fields
              SET name = ?, updatedAt = ?
              WHERE id = ? AND collectionId = ?
              `,
              rawField.name,
              now,
              fieldId,
              collectionId,
            )
          }
        }
      }
    } else if ("fieldOrder" in update) {
      // 3. Update field order (only if 'fields' not updated)
      for (const [index, fieldId] of update.fieldOrder!.entries()) {
        await db.runAsync(
          `
          UPDATE fields SET sortOrder = ?
          WHERE id = ? AND collectionId = ?
          `,
          index,
          fieldId,
          collectionId,
        )
      }
    }

    // 4. Touch collection if anything changed
    await touchCollection(collectionId, now)

    await db.execAsync("COMMIT")
    console.log("[DB] Collection structure updated:", collectionId)
  } catch (err) {
    console.error("[DB] Error editing collection structure:", err)
    await db.execAsync("ROLLBACK")
    throw err
  }
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

// NEW updateItemOrder:
/**
 * Updates the sortOrder of all items in a collection based on the provided order.
 *
 * This method rewrites the sortOrder for all items, which is simple and robust.
 *
 * ⚠️ Performance note:
 * In large collections, this may become inefficient.
 * In future we may switch to a fractional sortOrder strategy,
 * allowing O(1) moves with only one row updated per reordering action.
 */
export const updateItemOrder = async (
  collectionId: CollectionId,
  itemOrder: ItemId[],
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

  console.log("[DB] Updating item sort order for collection:", collectionId)

  await db.execAsync("BEGIN")
  try {
    for (let i = 0; i < itemOrder.length; i += 10) {
      const batch = itemOrder.slice(i, i + 10)

      const sql = batch
        .map(
          (id, iMap) =>
            `UPDATE items SET sortOrder = ${i + iMap} WHERE id = '${id}'`,
        )
        .join(";\n")

      await db.execAsync(sql)
    }

    await db.execAsync("COMMIT")
    console.log("[DB] Item order updated for collection:", collectionId)
  } catch (err) {
    console.error(
      "[DB] Error updating item order for collection:",
      collectionId,
      err,
    )
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
