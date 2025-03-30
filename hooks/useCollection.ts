import { useCollections } from "@/context/CollectionsContext"
import { CollectionId } from "@/app/types"

export function useCollection(id: CollectionId) {
  const { collections } = useCollections()
  return collections[id]
}
