import { deleteAsync, documentDirectory } from "expo-file-system"
import * as SQLite from "expo-sqlite"

import { Collection, CollectionId, CollectionsData } from "@/app/types"

const isDev = __DEV__
const log = (...args: any[]) => {
  if (isDev) console.log("[DB]", ...args)
}

const stringify = JSON.stringify
const parse = JSON.parse

let db: SQLite.SQLiteDatabase | null = null

export const initDatabase = async (): Promise<void> => {
  db = await SQLite.openDatabaseAsync("curator.db")

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      field_order TEXT NOT NULL,
      fields TEXT NOT NULL,
      item_order TEXT NOT NULL,
      items TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      field_id TEXT NOT NULL,
      data BLOB NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (item_id) REFERENCES collections (id)
    );
  `)

  await db.runAsync(
    `INSERT OR IGNORE INTO collections (id, name, field_order, fields, item_order, items)
     VALUES (?, ?, ?, ?, ?, ?)`,
    "__order__",
    "Collection Order",
    "[]",
    "{}",
    "[]",
    "[]",
  )

  log("Database initialized")
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
  if (!db) throw new Error("Database not initialized")

  await db.runAsync(
    `INSERT OR REPLACE INTO collections (id, name, field_order, fields, item_order, items)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    collection.name,
    stringify(collection.fieldOrder),
    stringify(collection.fields),
    stringify(collection.itemOrder),
    stringify(collection.items),
  )

  if (isNew) {
    const currentOrderRow = (await db.getFirstAsync(
      `SELECT items FROM collections WHERE id = ?`,
      "__order__",
    )) as { items: string }
    const existingOrder = parse(currentOrderRow.items) as CollectionId[]
    const updatedOrder = [...existingOrder, id]

    await db.runAsync(
      `UPDATE collections SET items = ? WHERE id = ?`,
      stringify(updatedOrder),
      "__order__",
    )
  }

  log(`Collection ${isNew ? "created" : "updated"}:`, id)
}

export const saveCollectionOrder = async (
  order: CollectionId[],
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")

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

  const currentOrderRow = (await db.getFirstAsync(
    `SELECT items FROM collections WHERE id = ?`,
    "__order__",
  )) as { items: string }
  const existingOrder = parse(currentOrderRow.items) as CollectionId[]
  const updatedOrder = existingOrder.filter(cid => cid !== id)

  await db.runAsync(
    `UPDATE collections SET items = ? WHERE id = ?`,
    stringify(updatedOrder),
    "__order__",
  )

  log("Collection deleted and order updated:", id)
}

export const resetDatabase = async (): Promise<void> => {
  await deleteAsync(`${documentDirectory}SQLite/curator.db`)
  await initDatabase()
}
