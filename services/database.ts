import * as FileSystem from "expo-file-system"
import * as SQLite from "expo-sqlite"
import * as Updates from "expo-updates"

import _ from "lodash"

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

type CollectionRow = {
  id: CollectionId
  name: string
  color: HexColor | null
  createdAt: number
  updatedAt: number
}

type FieldRow = {
  id: FieldId
  collectionId: CollectionId
  name: string
  type: FieldType
  config: string
  createdAt: number
  updatedAt: number
}

type ItemRow = {
  id: ItemId
  collectionId: CollectionId
  tags: string | null
  createdAt: number
  updatedAt: number
}

type ValueRow = {
  itemId: ItemId
  fieldId: FieldId
  value: string | null
}

export const hydrateCollection = (
  collectionRow: CollectionRow,
  fieldRows: FieldRow[],
  itemRows: ItemRow[],
  valueRows: ValueRow[],
): Collection => {
  const fieldOrder = fieldRows.map(f => f.id)
  const fields: Record<FieldId, Field> = {}
  for (const f of fieldRows) {
    fields[f.id] = {
      name: f.name,
      type: f.type,
      config: JSON.parse(f.config),
      _meta: {
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      },
    }
  }

  const itemOrder = itemRows.map(i => i.id)
  const items: Record<ItemId, Item> = {}
  for (const i of itemRows) {
    items[i.id] = {
      tags: i.tags ? JSON.parse(i.tags) : [],
      values: {},
      _meta: {
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      },
    }
  }

  for (const v of valueRows) {
    const item = items[v.itemId]
    if (!item) continue
    let parsed = v.value ? JSON.parse(v.value) : undefined
    if (Array.isArray(parsed)) parsed = parsed.map(v => v ?? undefined)
    item.values[v.fieldId] = parsed
  }

  return {
    name: collectionRow.name,
    color: collectionRow.color ?? undefined,
    fieldOrder,
    fields,
    itemOrder,
    items,
    _meta: {
      createdAt: collectionRow.createdAt,
      updatedAt: collectionRow.updatedAt,
    },
  }
}

// NEW loadCollections:
export const loadCollections = async (): Promise<CollectionsData> => {
  if (!db) throw new Error("Database not initialized")

  const collectionRows = await db.getAllAsync<CollectionRow>(
    `SELECT id, name, color, createdAt, updatedAt FROM collections ORDER BY sortOrder ASC`,
  )

  const fieldRows = await db.getAllAsync<FieldRow>(
    `SELECT id, collectionId, name, type, config, createdAt, updatedAt FROM fields ORDER BY sortOrder ASC`,
  )

  const itemRows = await db.getAllAsync<ItemRow>(
    `SELECT id, collectionId, tags, createdAt, updatedAt FROM items ORDER BY sortOrder ASC`,
  )

  const valueRows = await db.getAllAsync<ValueRow>(
    `SELECT itemId, fieldId, value FROM item_values`,
  )

  const fieldsByCollection: Record<CollectionId, FieldRow[]> = {}
  for (const f of fieldRows) {
    if (!fieldsByCollection[f.collectionId])
      fieldsByCollection[f.collectionId] = []
    fieldsByCollection[f.collectionId].push(f)
  }

  const itemsByCollection: Record<CollectionId, ItemRow[]> = {}
  for (const i of itemRows) {
    if (!itemsByCollection[i.collectionId])
      itemsByCollection[i.collectionId] = []
    itemsByCollection[i.collectionId].push(i)
  }

  const valuesByItem: Record<string, ValueRow[]> = {}
  for (const v of valueRows) {
    if (!valuesByItem[v.itemId]) valuesByItem[v.itemId] = []
    valuesByItem[v.itemId].push(v)
  }

  const collections: CollectionsData["collections"] = {}
  const collectionOrder: CollectionId[] = []

  for (const row of collectionRows) {
    const fields = fieldsByCollection[row.id] ?? []
    const items = itemsByCollection[row.id] ?? []
    const relevantValues = items.flatMap(i => valuesByItem[i.id] ?? [])
    collections[row.id] = hydrateCollection(row, fields, items, relevantValues)
    collectionOrder.push(row.id)
  }

  return { collections, collectionOrder }
}

const loadCollectionById = async (
  collectionId: CollectionId,
): Promise<Collection> => {
  if (!db) throw new Error("Database not initialized")

  const collectionRow = await db.getFirstAsync<CollectionRow>(
    `
    SELECT id, name, color, createdAt, updatedAt
    FROM collections
    WHERE id = ?
  `,
    [collectionId],
  )

  if (!collectionRow) throw new Error(`Collection ${collectionId} not found`)

  const fieldRows = await db.getAllAsync<FieldRow>(
    `
    SELECT id, collectionId, name, type, config, createdAt, updatedAt
    FROM fields
    WHERE collectionId = ?
    ORDER BY sortOrder ASC
  `,
    [collectionId],
  )

  const itemRows = await db.getAllAsync<ItemRow>(
    `
    SELECT id, collectionId, tags, createdAt, updatedAt
    FROM items
    WHERE collectionId = ?
    ORDER BY sortOrder ASC
  `,
    [collectionId],
  )

  const valueRows =
    itemRows.length === 0
      ? []
      : await db.getAllAsync<ValueRow>(`
    SELECT itemId, fieldId, value
    FROM item_values
    WHERE fieldId IN (${fieldRows.map(i => `'${i.id}'`).join(",")})
  `)

  return hydrateCollection(collectionRow, fieldRows, itemRows, valueRows)
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

// NEW updateCollection * now respecting collection updatedAt philosophy
// (ignore sort order updates and field/item CHANGES - just respect direct
// collection changes and field/item additions/deletions)
export const updateCollection = async (
  collectionId: CollectionId,
  raw: Partial<Pick<RawCollection, "name" | "color" | "fields" | "fieldOrder">>,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")
  console.log("[DB] Updating collection:", collectionId)

  const now = timestampNow()
  await db.execAsync("BEGIN")

  try {
    const existing = await loadCollectionById(collectionId)

    let hasMeaningfulChange = false

    // === 1. Compare and update collection name/color ===
    const nameChanged = "name" in raw && raw.name !== existing.name
    const colorChanged = "color" in raw && raw.color !== existing.color

    if (nameChanged || colorChanged) {
      const updates = []
      const values = []

      if (nameChanged) {
        updates.push("name = ?")
        values.push(raw.name ?? null)
      }

      if (colorChanged) {
        updates.push("color = ?")
        values.push(raw.color ?? null)
      }

      if (updates.length > 0) {
        hasMeaningfulChange = true
        values.push(collectionId)
        await db.runAsync(
          `UPDATE collections SET ${updates.join(", ")} WHERE id = ?`,
          ...values,
        )
      }
    }

    // === 2. Compare and update fields ===
    if (raw.fields) {
      const newFieldIds = new Set(Object.keys(raw.fields))
      const existingFieldIds = new Set(Object.keys(existing.fields))

      // 2a. Delete removed fields
      for (const fieldId of existingFieldIds) {
        if (!newFieldIds.has(fieldId)) {
          await db.runAsync("DELETE FROM fields WHERE id = ?", fieldId)
          hasMeaningfulChange = true
        }
      }

      // 2b. Add or update fields
      for (const [fieldId, newField] of Object.entries(raw.fields)) {
        const existingField = existing.fields[fieldId as FieldId]
        if (!existingField) {
          await db.runAsync(
            `INSERT INTO fields (id, collectionId, name, type, config, sortOrder, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            fieldId,
            collectionId,
            newField.name,
            newField.type,
            JSON.stringify(newField.config),
            raw.fieldOrder?.indexOf(fieldId as FieldId) ?? 0,
            now,
            now,
          )
          hasMeaningfulChange = true
        } else if (
          existingField.name !== newField.name ||
          existingField.type !== newField.type ||
          !_.isEqual(existingField.config, newField.config)
        ) {
          await db.runAsync(
            `UPDATE fields SET name = ?, type = ?, config = ?, updatedAt = ? WHERE id = ?`,
            newField.name,
            newField.type,
            JSON.stringify(newField.config),
            now,
            fieldId,
          )
        }
      }
    }

    // === 3. Compare and update field order ===
    if (raw.fieldOrder && !_.isEqual(raw.fieldOrder, existing.fieldOrder)) {
      for (const [index, fieldId] of raw.fieldOrder.entries()) {
        await db.runAsync(
          `UPDATE fields SET sortOrder = ? WHERE id = ? AND collectionId = ?`,
          index,
          fieldId,
          collectionId,
        )
      }
      // Note: sort order changes do NOT trigger updatedAt
    }

    // === 4. Final updatedAt touch ===
    if (hasMeaningfulChange) {
      await db.runAsync(
        `UPDATE collections SET updatedAt = ? WHERE id = ?`,
        now,
        collectionId,
      )
    }

    await db.execAsync("COMMIT")
    console.log("[DB] Collection updated:", collectionId)
  } catch (err) {
    console.error("[DB] Error updating collection:", err)
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
