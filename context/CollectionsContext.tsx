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
import { patchCollection } from "@/helpers/meta"
import * as db from "@/services/database"

export type CollectionInput = Pick<
  RawCollection,
  "name" | "fields" | "fieldOrder"
>

type CollectionsContextValue = {
  collections: CollectionsData["collections"]
  collectionOrder: CollectionId[]
  seedCollectionsFromJSON: () => Promise<void>
  addCollection: (data: CollectionInput) => CollectionId
  deleteCollection: (collectionId: CollectionId) => void
  updateCollection: (collectionId: CollectionId, data: CollectionInput) => void
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
  const [collections, setCollections] = useState<
    CollectionsData["collections"]
  >({})
  const [collectionOrder, setCollectionOrder] = useState<CollectionId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const initializeData = async () => {
      try {
        await db.initDatabase()
        let data = await db.loadCollections()

        if (Object.keys(data.collections).length === 0) {
          console.log("[Context] Fresh DB detected — seeding from JSON")
          await seedCollectionsFromJSON()
          data = await db.loadCollections()
        }

        setCollections(data.collections)
        setCollectionOrder(data.collectionOrder)
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

    setCollections(prev => {
      const updated = { ...prev, [collectionId]: hydrated }

      db.saveCollection(collectionId, hydrated, true).catch(err => {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to save new collection"),
        )
      })

      return updated
    })

    setCollectionOrder(prev => {
      const updatedOrder = [...prev, collectionId]

      db.saveCollectionOrder(updatedOrder).catch(err => {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to save collection order"),
        )
      })

      return updatedOrder
    })

    return collectionId
  }

  const deleteCollection = (collectionId: CollectionId): void => {
    // Optimistically update state
    setCollections(prev => {
      const updated = { ...prev }
      delete updated[collectionId]
      return updated
    })

    setCollectionOrder(prev => prev.filter(id => id !== collectionId))

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
    updated: Partial<RawCollection>,
  ) => {
    setCollections(prev => {
      const current = prev[collectionId]
      if (!current) return prev

      try {
        const updatedCollection = patchCollection(current, updated, {
          strictFieldTypes: true,
        })

        if (updatedCollection._meta.updatedAt === current._meta.updatedAt) {
          // nothing changed
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
          [collectionId]: updatedCollection,
        }
      } catch (err) {
        console.warn(
          err instanceof Error
            ? err.message
            : "Unknown error patching collection",
        )
        return prev
      }
    })
  }

  const addItem = (collectionId: CollectionId, item: RawItem) => {
    const itemId = genItemId()

    // TODO (2025-04-13): This uses `updateCollection`, which saves the full collection.
    // It's clean and consistent, but could be optimized to save only item changes.

    const current = collections[collectionId]
    if (!current) return itemId

    updateCollection(collectionId, {
      itemOrder: [...current.itemOrder, itemId],
      items: {
        ...current.items,
        [itemId]: item,
      },
    })

    return itemId
  }

  const updateItem = (
    collectionId: CollectionId,
    itemId: ItemId,
    updatedItem: RawItem,
  ) => {
    // TODO (2025-04-13): This uses `updateCollection`, which saves the full collection.
    // It's clean and consistent, but could be optimized to save only item changes.

    updateCollection(collectionId, {
      items: {
        [itemId]: updatedItem,
      },
    })
  }

  const updateCollectionOrder = (newOrder: CollectionId[]) => {
    setCollectionOrder(newOrder)

    db.saveCollectionOrder(newOrder).catch(err => {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to save collection order"),
      )
    })
  }

  const updateItemOrder = (collectionId: CollectionId, newOrder: ItemId[]) => {
    // TODO (2025-04-13): This uses `updateCollection`, which saves the full collection.
    // It's clean and consistent, but could be optimized to only update item order.

    updateCollection(collectionId, {
      itemOrder: newOrder,
    })
  }

  const deleteItem = (collectionId: CollectionId, itemId: ItemId) => {
    // TODO (2025-04-13): This uses `updateCollection`, which saves the full collection.
    // It's clean and consistent, but could be optimized to save only item changes.

    const current = collections[collectionId]
    if (!current) return

    const updatedItems = { ...current.items }
    delete updatedItems[itemId]

    const updatedItemOrder = current.itemOrder.filter(id => id !== itemId)

    updateCollection(collectionId, {
      itemOrder: updatedItemOrder,
      items: updatedItems,
    })
  }

  /** DEV ONLY! */
  const seedCollectionsFromJSON = async () => {
    const { collectionOrder, collections } = data as unknown as CollectionsData
    const newCollectionOrder = [] as CollectionId[]

    for (const cId of collectionOrder) {
      const { name, fieldOrder, fields, itemOrder, items } = collections[cId]

      // Add collection and get the new ID
      const newId = addCollection({ name, fieldOrder, fields })
      newCollectionOrder.push(newId)

      // Add items in order
      for (const iId of itemOrder) {
        const item = items[iId]
        addItem(newId, item)
      }
    }

    setCollectionOrder(newCollectionOrder)
  }

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        collectionOrder,
        seedCollectionsFromJSON,
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
