import { CollectionId, Item, ItemId } from "@/app/types"
import { useCollections } from "@/context/CollectionsContext"

export function useCollection(id: CollectionId) {
  const { collections, addItem, updateItemOrder } = useCollections()
  const collection = collections[id]

  return {
    ...collection,
    addItem: (item: Item) => addItem(id, item),
    updateItemOrder: (itemOrder: ItemId[]) => updateItemOrder(id, itemOrder),
    getItem: (itemId: ItemId) => collection.items[itemId],
    getItemIndex: (itemId: ItemId) => collection.itemOrder.indexOf(itemId),
  }
}
