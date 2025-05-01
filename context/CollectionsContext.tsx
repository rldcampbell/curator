import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react"

import _ from "lodash"

import data from "@/app/data.json"
import {
  CollectionId,
  CollectionsData,
  Item,
  ItemId,
  RawCollection,
  RawItem,
} from "@/app/types"
import { genCollectionId, genItemId } from "@/helpers"
import { timestampNow } from "@/helpers/date"
import { patchCollection, touchMeta, withMeta } from "@/helpers/meta"
import * as db from "@/services/database"

import { collectionsReducer } from "./collectionsReducer"

export type CollectionInput = Pick<
  RawCollection,
  "name" | "fields" | "fieldOrder" | "color"
>

type CollectionsContextValue = {
  collections: CollectionsData["collections"]
  collectionOrder: CollectionId[]
  addCollection: (data: CollectionInput) => CollectionId
  deleteCollection: (collectionId: CollectionId) => void
  updateCollection: (
    collectionId: CollectionId,
    collection: CollectionInput,
  ) => void
  updateCollectionOrder: (order: CollectionId[]) => void
  deleteItem: (collectionId: CollectionId, itemId: ItemId) => void
  addItem: (collectionId: CollectionId, item: RawItem) => ItemId
  updateItem: (
    collectionId: CollectionId,
    itemId: ItemId,
    updatedItem: RawItem,
  ) => void
  updateItemOrder: (collectionId: CollectionId, itemOrder: ItemId[]) => void
  isLoading: boolean
  error: Error | null
}

const CollectionsContext = createContext<CollectionsContextValue | undefined>(
  undefined,
)

export const CollectionsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [collectionsData, dispatchCollectionsAction] = useReducer(
    collectionsReducer,
    {
      collections: {},
      collectionOrder: [],
    },
  )

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // UPDATED
  useEffect(() => {
    const initializeData = async () => {
      try {
        const { isFreshDb } = await db.initDatabase()

        if (isFreshDb) {
          console.log("[INIT] Fresh DB detected — seeding from JSON")
          await seedCollectionsFromJSON()
        }

        const data = await db.loadCollections()

        console.log(
          "[INIT] Loaded collections:",
          Object.keys(data.collections).length,
        )
        console.log("[INIT] Loaded collectionOrder:", data.collectionOrder)

        const dupes = data.collectionOrder.filter(
          (id, idx, arr) => arr.indexOf(id) !== idx,
        )
        if (dupes.length > 0) {
          console.warn("[INIT] DUPLICATE IDs FOUND IN ORDER:", dupes)
        }

        dispatchCollectionsAction({ type: "set_collections_data", data })
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load collections"),
        )
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [])

  // UPDATED but check db!
  const addCollection = (collection: CollectionInput) => {
    const collectionId = genCollectionId()

    const timestamp = timestampNow()

    const fields = Object.fromEntries(
      Object.entries(collection.fields).map(([fieldId, rawField]) => [
        fieldId,
        withMeta(rawField, timestamp),
      ]),
    )

    dispatchCollectionsAction({
      type: "add_collection",
      collectionId,
      collection: withMeta(
        {
          ...collection,
          fields,
          itemOrder: [],
          items: {},
        },
        timestamp,
      ),
    })

    db.addCollection(collectionId, collection) // check db sorts all _meta!

    return collectionId
  }

  // UPDATED
  const deleteCollection = (collectionId: CollectionId): void => {
    if (!collectionsData.collections[collectionId]) return

    dispatchCollectionsAction({ type: "delete_collection", collectionId })

    db.deleteCollection(collectionId)
  }

  // UPDATED (but check db call)
  const updateCollection = (
    collectionId: CollectionId,
    patch: Partial<
      Pick<RawCollection, "color" | "fieldOrder" | "fields" | "name">
    >,
  ) => {
    const existingCollection = collectionsData.collections[collectionId]
    if (!existingCollection) return

    const collection = patchCollection(
      collectionsData.collections[collectionId],
      patch,
    )
    if (collection === null) return

    dispatchCollectionsAction({
      type: "update_collection",
      collectionId,
      collection,
    })

    db.updateCollection(collectionId, patch) // TODO: check this handles everything!
  }

  // UPDATED (but check db call)
  const addItem = (collectionId: CollectionId, item: RawItem) => {
    const itemId = genItemId()

    dispatchCollectionsAction({
      type: "add_item",
      collectionId,
      itemId,
      item: withMeta(item),
    })

    db.addItem(collectionId, itemId, item) // TODO: check this handles everything! Otherwise refactor?

    return itemId
  }

  // UPDATED but check db logic...!
  const updateItem = (
    collectionId: CollectionId,
    itemId: ItemId,
    patch: Partial<RawItem>,
  ) => {
    const existingCollection = collectionsData.collections[collectionId]
    if (!existingCollection) return

    const existingItem = existingCollection.items[itemId]
    if (!existingItem) return

    const item = patchItem(existingItem, patch)
    if (item === null) return

    dispatchCollectionsAction({
      type: "update_item",
      collectionId,
      itemId,
      item,
    })

    db.updateItem(itemId, patch) // check everything handled!
  }

  // UPDATED but check db logic
  const updateCollectionOrder = (collectionOrder: CollectionId[]) => {
    if (_.isEqual(collectionsData.collectionOrder, collectionOrder)) return

    dispatchCollectionsAction({
      type: "update_collection_order",
      collectionOrder,
    })

    db.updateCollectionOrder(collectionOrder) // check logic!
  }

  // UPDATED but check db logic
  const updateItemOrder = (collectionId: CollectionId, itemOrder: ItemId[]) => {
    if (
      _.isEqual(collectionsData.collections[collectionId]?.itemOrder, itemOrder)
    )
      return

    dispatchCollectionsAction({
      type: "update_item_order",
      collectionId,
      itemOrder,
      timestamp: timestampNow(),
    })

    db.updateItemOrder(collectionId, itemOrder) // check!
  }

  // UPDATED but check db logic
  const deleteItem = (collectionId: CollectionId, itemId: ItemId) => {
    if (
      !collectionsData.collections[collectionId] ||
      !collectionsData.collections[collectionId].items[itemId]
    ) {
      return
    }

    dispatchCollectionsAction({
      type: "delete_item",
      collectionId,
      itemId,
      timestamp: timestampNow(),
    })

    db.deleteItem(itemId) // check db logic sound!
  }

  /** DEV ONLY! */
  const seedCollectionsFromJSON = async () => {
    console.log("[SEED] Seeding collections from data.json...")
    const { collectionOrder, collections } = data as unknown as CollectionsData

    for (const cId of collectionOrder) {
      const { name, fieldOrder, fields, itemOrder, items } = collections[cId]

      console.log(`[SEED] Adding collection: ${name}`)
      const newId = addCollection({ name, fieldOrder, fields })

      console.log(
        `[SEED] Adding ${itemOrder.length} items to collection ${name} [${newId}]`,
      )

      for (const iId of itemOrder) {
        const item = items[iId]

        // Wait one tick before next addItem
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            addItem(newId, item)
            resolve(null)
          })
        })
      }
    }

    console.log("[SEED] Finished seeding collections.")
  }

  return (
    <CollectionsContext.Provider
      value={{
        collections: collectionsData.collections,
        collectionOrder: collectionsData.collectionOrder,
        addCollection,
        deleteCollection,
        updateCollection,
        addItem,
        deleteItem,
        updateItem,
        updateItemOrder,
        updateCollectionOrder,
        isLoading,
        error,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  )
}

export const useCollections = () => {
  const context = useContext(CollectionsContext)
  if (!context)
    throw new Error("useCollections must be used within CollectionsProvider")
  return context
}

const patchItem = (existingItem: Item, patch: Partial<RawItem>) => {
  const updatedItem = { ...existingItem, ...patch }

  if (_.isEqual(existingItem, updatedItem)) return null

  return touchMeta(updatedItem)
}
