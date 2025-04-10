import { deleteAsync, documentDirectory } from "expo-file-system"
import * as SQLite from "expo-sqlite"

import data from "@/app/data.json"
import { Collection, CollectionId, CollectionsData } from "@/app/types"
import { timestampNow } from "@/helpers/date"

import { migrateDatabase } from "./migrations/runMigrations"

const isDev = __DEV__
const log = (...args: any[]) => {
  if (isDev) console.log("[DB]", ...args)
}

const stringify = JSON.stringify
const parse = JSON.parse

let db: SQLite.SQLiteDatabase | null = null

export const initDatabase = async (): Promise<void> => {
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
      id, name, field_order, fields, item_order, items, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    name,
    stringify(fieldOrder),
    stringify(fields),
    stringify(itemOrder),
    stringify(items),
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
    createdAt: number
    updatedAt: number
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
        _meta: {
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
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

  const now = timestampNow()

  for (const id of collectionOrder) {
    const collection = collections[id]

    // Patch missing createdAt/updatedAt
    const withMeta: Collection = {
      ...collection,
      _meta: {
        createdAt: collection._meta.createdAt ?? now,
        updatedAt: collection._meta.updatedAt ?? now,
      },
      fields: Object.fromEntries(
        Object.entries(collection.fields).map(([fid, field]) => [
          fid,
          {
            ...field,
            _meta: {
              createdAt: field._meta.createdAt ?? now,
              updatedAt: field._meta.updatedAt ?? now,
            },
          },
        ]),
      ),
      items: Object.fromEntries(
        Object.entries(collection.items).map(([iid, item]) => [
          iid,
          {
            ...item,
            _meta: {
              createdAt: item._meta.createdAt ?? now,
              updatedAt: item._meta.updatedAt ?? now,
            },
          },
        ]),
      ),
    }

    await upsertCollection(id, withMeta)
  }

  await saveCollectionOrder(collectionOrder)

  log("Database seeded with initial data")
}
