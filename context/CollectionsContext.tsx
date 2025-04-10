import { createContext, useContext, useEffect, useState } from "react"

import {
  Collection,
  CollectionId,
  CollectionsData,
  FieldId,
  Item,
  ItemId,
} from "@/app/types"
import { genCollectionId, genItemId } from "@/helpers"
import * as db from "@/services/database"

export type CollectionInput = Pick<Collection, "name" | "fields" | "fieldOrder">

type CollectionsContextValue = {
  collections: CollectionsData["collections"]
  collectionOrder: CollectionId[]
  addCollection: (data: CollectionInput) => CollectionId
  deleteCollection: (collectionId: CollectionId) => void
  updateCollection: (collectionId: CollectionId, data: CollectionInput) => void
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

  const addCollection = ({ name, fieldOrder, fields }: CollectionInput) => {
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

  const updateCollection = (
    collectionId: CollectionId,
    updated: CollectionInput,
  ) => {
    setCollections(prev => {
      const current = prev[collectionId]
      if (!current) return prev

      // Disallow type changes for existing fields
      for (const fieldId of Object.keys(current.fields)) {
        const original = current.fields[fieldId as FieldId]
        const replacement = updated.fields[fieldId as FieldId]
        if (replacement && replacement.type !== original.type) {
          console.warn(
            `Field type change not allowed: ${fieldId} (${original.type} → ${replacement.type})`,
          )
          return prev
        }
      }

      // Remove deleted field values from items
      const removedFieldIds = Object.keys(current.fields).filter(
        id => !(id in updated.fields),
      ) as FieldId[]

      const cleanedItems: Record<ItemId, Item> = {}
      for (const [itemId, item] of Object.entries(current.items)) {
        const cleanedItem = { ...item }
        for (const removedId of removedFieldIds) {
          delete cleanedItem[removedId]
        }
        cleanedItems[itemId as ItemId] = cleanedItem
      }

      const updatedCollection: Collection = {
        name: updated.name,
        fieldOrder: updated.fieldOrder,
        fields: updated.fields,
        itemOrder: current.itemOrder,
        items: cleanedItems,
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
