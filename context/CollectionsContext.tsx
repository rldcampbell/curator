import { createContext, useContext, useEffect, useState } from "react"

import {
  Collection,
  CollectionId,
  CollectionsData,
  Item,
  ItemId,
} from "@/app/types"
import { genCollectionId, genItemId } from "@/helpers"
import {
  initDatabase,
  loadCollections,
  saveCollection,
} from "@/services/database"

type NewCollectionInput = Omit<Collection, "itemOrder" | "items">

type CollectionsContextValue = {
  collections: CollectionsData["collections"]
  collectionOrder: CollectionId[]
  saveCollection: (data: NewCollectionInput) => void
  addItem: (collectionId: CollectionId, item: Item) => ItemId
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
        await initDatabase()
        const data = await loadCollections()
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

  const saveCollectionHandler = ({
    name,
    fieldOrder,
    fields,
  }: NewCollectionInput) => {
    const id = genCollectionId()
    const newCollection: Collection = {
      name,
      fieldOrder,
      fields,
      itemOrder: [],
      items: {},
    }

    setCollections(prev => {
      const updated = { ...prev, [id]: newCollection }

      saveCollection(id, newCollection, true).catch(err => {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to save new collection"),
        )
      })

      return updated
    })

    setCollectionOrder(prev => [...prev, id])
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

      saveCollection(collectionId, updated[collectionId]).catch(err => {
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

  const updateItemOrder = (collectionId: CollectionId, newOrder: ItemId[]) => {
    setCollections(prev => {
      const updated: Record<CollectionId, Collection> = {
        ...prev,
        [collectionId]: {
          ...prev[collectionId],
          itemOrder: newOrder,
        },
      }

      saveCollection(collectionId, updated[collectionId]).catch(err => {
        setError(
          err instanceof Error ? err : new Error("Failed to update item order"),
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
        saveCollection: saveCollectionHandler,
        addItem,
        updateItemOrder,
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
