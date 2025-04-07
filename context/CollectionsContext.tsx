import { createContext, useContext, useEffect, useState } from "react"

import {
  Collection,
  CollectionId,
  CollectionsData,
  Item,
  ItemId,
} from "@/app/types"
import { genCollectionId, genItemId } from "@/helpers"
import * as db from "@/services/database"

type NewCollectionInput = Omit<Collection, "itemOrder" | "items">

type CollectionsContextValue = {
  collections: CollectionsData["collections"]
  collectionOrder: CollectionId[]
  addCollection: (data: NewCollectionInput) => CollectionId
  deleteCollection: (collectionId: CollectionId) => void
  updateCollectionOrder: (order: CollectionId[]) => void
  deleteItem: (collectionId: CollectionId, itemId: ItemId) => void
  addItem: (collectionId: CollectionId, item: Item) => ItemId
  updateItem: (
    collectionId: CollectionId,
    itemId: ItemId,
    updatedItem: Item,
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
        const data = await db.loadCollections()
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

  const addCollection = ({ name, fieldOrder, fields }: NewCollectionInput) => {
    const collectionId = genCollectionId()
    const newCollection: Collection = {
      name,
      fieldOrder,
      fields,
      itemOrder: [],
      items: {},
    }

    setCollections(prev => {
      const updated = { ...prev, [collectionId]: newCollection }

      db.saveCollection(collectionId, newCollection, true).catch(err => {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to save new collection"),
        )
      })

      return updated
    })

    setCollectionOrder(prev => [...prev, collectionId])

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

  const addItem = (collectionId: CollectionId, item: Item) => {
    const itemId = genItemId()

    setCollections(prev => {
      const collection = prev[collectionId]
      const updated: Record<CollectionId, Collection> = {
        ...prev,
        [collectionId]: {
          ...collection,
          itemOrder: [...collection.itemOrder, itemId],
          items: {
            ...collection.items,
            [itemId]: item,
          },
        },
      }

      db.saveCollection(collectionId, updated[collectionId]).catch(err => {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to save item to collection"),
        )
      })

      return updated
    })

    return itemId
  }

  const updateItem = (
    collectionId: CollectionId,
    itemId: ItemId,
    updatedItem: Item,
  ) => {
    setCollections(prev => {
      const collection = prev[collectionId]
      const updated: Record<CollectionId, Collection> = {
        ...prev,
        [collectionId]: {
          ...collection,
          items: {
            ...collection.items,
            [itemId]: updatedItem,
          },
        },
      }

      db.saveCollection(collectionId, updated[collectionId]).catch(err => {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update item in collection"),
        )
      })

      return updated
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
    setCollections(prev => {
      const updated: Record<CollectionId, Collection> = {
        ...prev,
        [collectionId]: {
          ...prev[collectionId],
          itemOrder: newOrder,
        },
      }

      db.saveCollection(collectionId, updated[collectionId]).catch(err => {
        setError(
          err instanceof Error ? err : new Error("Failed to update item order"),
        )
      })

      return updated
    })
  }

  const deleteItem = (collectionId: CollectionId, itemId: ItemId) => {
    setCollections(prev => {
      const collection = prev[collectionId]

      if (!collection) return prev

      const updatedItems = { ...collection.items }
      delete updatedItems[itemId]

      const updatedItemOrder = collection.itemOrder.filter(id => id !== itemId)

      const updatedCollection: Collection = {
        ...collection,
        items: updatedItems,
        itemOrder: updatedItemOrder,
      }

      const updated = {
        ...prev,
        [collectionId]: updatedCollection,
      }

      db.saveCollection(collectionId, updatedCollection).catch(err => {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to delete item from collection"),
        )
      })

      return updated
    })
  }

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        collectionOrder,
        addCollection,
        deleteCollection,
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
