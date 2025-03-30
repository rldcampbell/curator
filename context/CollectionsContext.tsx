import { createContext, useContext, useState } from "react"
import { CollectionId, CollectionsData, Field, FieldId } from "@/app/types"
import { genCollectionId } from "@/helpers"

type NewCollectionInput = {
  name: string
  fieldOrder: FieldId[]
  fields: Record<FieldId, Field>
}

type CollectionsContextValue = {
  collections: CollectionsData["collections"]
  collectionOrder: CollectionId[]
  saveCollection: (data: NewCollectionInput) => void
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
      },
    }))
    setCollectionOrder(prev => [...prev, id])
  }

  return (
    <CollectionsContext.Provider
      value={{ collections, collectionOrder, saveCollection }}
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
