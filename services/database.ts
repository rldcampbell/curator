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

import { Collection, CollectionId, CollectionsData } from "@/app/types"
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

export const loadCollections = async (): Promise<CollectionsData> => {
  if (!db) throw new Error("Database not initialized")

  const rows = await db.getAllAsync("SELECT * FROM collections")

  type CollectionRow = {
    id: CollectionId | "__order__"
    name: string
    field_order: string
    fields: string
    item_order: string
    items: string
    color: string | null
    created_at: number
    updated_at: number
  }

  const collections: Record<CollectionId, Collection> = {}
  let collectionOrder: CollectionId[] = []

  for (const row of rows as CollectionRow[]) {
    if (row.id === "__order__") {
      collectionOrder = parse(row.items)
    } else {
      collections[row.id] = {
        name: row.name,
        fieldOrder: parse(row.field_order),
        fields: parse(row.fields),
        itemOrder: parse(row.item_order),
        items: parse(row.items),
        color: (row.color as HexColor | null) ?? undefined,
        _meta: {
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
      }
    }
  }

  log(`Loaded ${Object.keys(collections).length} collections`)
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
