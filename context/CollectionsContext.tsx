import { createContext, useContext, useState } from "react"
import {
  Collection,
  CollectionId,
  CollectionsData,
  Item,
  ItemId,
} from "@/app/types"
import { genCollectionId, genItemId } from "@/helpers"

type NewCollectionInput = Omit<Collection, "itemOrder" | "items">

type CollectionsContextValue = {
  collections: CollectionsData["collections"]
  collectionOrder: CollectionId[]
  saveCollection: (data: NewCollectionInput) => void
  addItem: (collectionId: CollectionId, item: Item) => ItemId
  updateItemOrder: (collectionId: CollectionId, itemOrder: ItemId[]) => void
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
    CollectionsContextValue["collections"]
  >({})
  const [collectionOrder, setCollectionOrder] = useState<CollectionId[]>([])

  const saveCollection = ({ name, fieldOrder, fields }: NewCollectionInput) => {
    const id = genCollectionId()
    setCollections(prev => ({
      ...prev,
      [id]: {
        name,
        fieldOrder,
        fields,
        itemOrder: [],
        items: {},
      },
    }))
    setCollectionOrder(prev => [...prev, id])
  }

  const addItem = (collectionId: CollectionId, item: Item) => {
    const itemId = genItemId()
    setCollections(prev => {
      const collection = prev[collectionId]
      return {
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
    })
    return itemId
  }

  const updateItemOrder = (collectionId: CollectionId, newOrder: ItemId[]) => {
    setCollections(prev => ({
      ...prev,
      [collectionId]: {
        ...prev[collectionId],
        itemOrder: newOrder,
      },
    }))
  }

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        collectionOrder,
        saveCollection,
        addItem,
        updateItemOrder,
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
