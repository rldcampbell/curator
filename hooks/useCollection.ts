import { CollectionId, Item, ItemId } from "@/app/types"
import { useCollections } from "@/context/CollectionsContext"

export function useCollection(collectionId: CollectionId) {
  const { collections, addItem, updateItemOrder, updateItem } = useCollections()
  const collection = collections[collectionId]

  return {
    ...collection,
    addItem: (item: Item) => addItem(collectionId, item),
    updateItem: (itemId: ItemId, item: Item) =>
      updateItem(collectionId, itemId, item),
    updateItemOrder: (itemOrder: ItemId[]) =>
      updateItemOrder(collectionId, itemOrder),
    getItem: (itemId: ItemId) => collection.items[itemId],
    getItemIndex: (itemId: ItemId) => collection.itemOrder.indexOf(itemId),
  }
}
