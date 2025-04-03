import { deleteAsync, documentDirectory } from "expo-file-system"
import * as SQLite from "expo-sqlite"

import data from "@/app/data.json"
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

  const existingOrder = await db.getFirstAsync(
    `SELECT id FROM collections WHERE id = ?`,
    "__order__",
  )

  if (!existingOrder) {
    log("Fresh DB detected — running seedDatabaseFromJSON")
    await db.runAsync(
      `INSERT INTO collections (id, name, field_order, fields, item_order, items)
       VALUES (?, ?, ?, ?, ?, ?)`,
      "__order__",
      "Collection Order",
      "[]",
      "{}",
      "[]",
      "[]",
    )
    await seedDatabaseFromJSON()
  } else {
    log("DB already initialized — skipping seed")
  }

  log("Database initialized")
}

const upsertCollection = async (
  id: CollectionId,
  collection: Collection,
): Promise<void> => {
  if (!db) throw new Error("Database not initialized")
  const { name, fieldOrder, fields, itemOrder, items } = collection

  await db.runAsync(
    `INSERT OR REPLACE INTO collections (id, name, field_order, fields, item_order, items)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    name,
    stringify(fieldOrder),
    stringify(fields),
    stringify(itemOrder),
    stringify(items),
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
  await deleteAsync(`${documentDirectory}SQLite/curator.db`)
  await initDatabase()
}

// Dev-only: seeds the DB with collections/items from data.json
const seedDatabaseFromJSON = async (): Promise<void> => {
  const { collectionOrder, collections } = data as unknown as CollectionsData
  log("Seeding collections from data.json:", collectionOrder.length)

  for (const id of collectionOrder) {
    const collection = collections[id]
    await upsertCollection(id, collection)
  }

  await saveCollectionOrder(collectionOrder)

  log("Database seeded with initial data")
}
