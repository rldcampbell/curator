import { createContext, useContext, useEffect, useState } from "react"

import data from "@/app/data.json"
import {
  CollectionId,
  CollectionsData,
  ItemId,
  RawCollection,
  RawItem,
} from "@/app/types"
import { genCollectionId, genItemId } from "@/helpers"
import { timestampNow } from "@/helpers/date"
import { patchCollection, stripMeta } from "@/helpers/meta"
import * as db from "@/services/database"

export type CollectionInput = Pick<
  RawCollection,
  "name" | "fields" | "fieldOrder"
>

type UpdateCollectionFn = (prev: RawCollection) => Partial<RawCollection>

type CollectionsContextValue = {
  collections: CollectionsData["collections"]
  collectionOrder: CollectionId[]
  addCollection: (data: CollectionInput) => CollectionId
  deleteCollection: (collectionId: CollectionId) => void
  updateCollection: (
    collectionId: CollectionId,
    updateFn: UpdateCollectionFn,
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
  const [collectionsData, setCollectionsData] = useState<CollectionsData>({
    collections: {},
    collectionOrder: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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

        setCollectionsData(data)
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

  const addCollection = ({ name, fieldOrder, fields }: CollectionInput) => {
    const collectionId = genCollectionId()
    console.log("[addCollection] Creating collection:", collectionId)

    const timestamp = timestampNow()

    const hydrated = patchCollection(
      {
        name: "",
        fieldOrder: [],
        itemOrder: [],
        fields: {},
        items: {},
        _meta: {
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      },
      {
        name,
        fieldOrder,
        fields,
      },
      { timestamp },
    )

    setCollectionsData(prev => {
      const updated: CollectionsData = {
        collectionOrder: [...prev.collectionOrder, collectionId],
        collections: { ...prev.collections, [collectionId]: hydrated },
      }

      // NOTE: this updates collection order in the db too - no need to duplicate
      db.saveCollection(collectionId, hydrated, true).catch(err => {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to save new collection"),
        )
      })

      return updated
    })

    return collectionId
  }

  const deleteCollection = (collectionId: CollectionId): void => {
    setCollectionsData(({ collections, collectionOrder }) => {
      const updatedCollections = { ...collections }
      delete updatedCollections[collectionId]

      return {
        collectionOrder: collectionOrder.filter(id => id !== collectionId),
        collections: updatedCollections,
      }
    })

    // Persist deletion in background
    db.deleteCollection(collectionId).catch(err => {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to delete collection from database"),
      )
      // Optional: re-sync state or notify user
    })
  }

  const updateCollection = (
    collectionId: CollectionId,
    updateFn: UpdateCollectionFn,
  ) => {
    setCollectionsData(prev => {
      const current = prev.collections[collectionId]
      if (!current) return prev

      const input = updateFn(stripMeta(current))

      const updatedCollection = patchCollection(current, input, {
        strictFieldTypes: true,
      })

      if (updatedCollection._meta.updatedAt === current._meta.updatedAt) {
        return prev
      }

      db.saveCollection(collectionId, updatedCollection).catch(err => {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to persist updated collection"),
        )
      })

      return {
        ...prev,
        collections: {
          ...prev.collections,
          [collectionId]: updatedCollection,
        },
      }
    })
  }

  const addItem = (collectionId: CollectionId, item: RawItem) => {
    const itemId = genItemId()

    // TODO (2025-04-13): This uses `updateCollection`, which saves the full collection.
    // It's clean and consistent, but could be optimized to save only item changes.

    updateCollection(collectionId, current => ({
      itemOrder: [...current.itemOrder, itemId],
      items: {
        ...current.items,
        [itemId]: item,
      },
    }))

    return itemId
  }

  const updateItem = (
    collectionId: CollectionId,
    itemId: ItemId,
    updatedItem: RawItem,
  ) => {
    // TODO (2025-04-13): This uses `updateCollection`, which saves the full collection.
    // It's clean and consistent, but could be optimized to save only item changes.

    updateCollection(collectionId, prev => ({
      items: {
        ...prev.items,
        [itemId]: updatedItem,
      },
    }))
  }

  const updateCollectionOrder = (newOrder: CollectionId[]) => {
    setCollectionsData(prev => ({
      ...prev,
      collectionOrder: newOrder,
    }))

    db.saveCollectionOrder(newOrder).catch(err => {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to save collection order"),
      )
    })
  }

  const updateItemOrder = (collectionId: CollectionId, itemOrder: ItemId[]) => {
    // TODO (2025-04-13): This uses `updateCollection`, which saves the full collection.
    // It's clean and consistent, but could be optimized to only update item order.

    updateCollection(collectionId, () => ({
      itemOrder,
    }))
  }

  const deleteItem = (collectionId: CollectionId, itemId: ItemId) => {
    // TODO (2025-04-13): This uses `updateCollection`, which saves the full collection.
    // It's clean and consistent, but could be optimized to save only item changes.

    updateCollection(collectionId, ({ items, itemOrder }) => {
      const updatedItems = { ...items }
      delete updatedItems[itemId]

      const updatedItemOrder = itemOrder.filter(id => id !== itemId)

      return {
        itemOrder: updatedItemOrder,
        items: updatedItems,
      }
    })
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
