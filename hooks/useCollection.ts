import { useCollections } from "@/context/CollectionsContext"
import { CollectionId, Item, ItemId } from "@/app/types"

export function useCollection(id: CollectionId) {
  const { collections, addItem, updateItemOrder } = useCollections()
  const collection = collections[id]

  return {
    ...collection,
    addItem: (item: Item) => addItem(id, item),
    updateItemOrder: (itemOrder: ItemId[]) => updateItemOrder(id, itemOrder),
  }
}
