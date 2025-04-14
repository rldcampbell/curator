import { CollectionId, ItemId, RawItem } from "@/app/types"
import { CollectionInput, useCollections } from "@/context/CollectionsContext"

export function useCollection(collectionId: CollectionId) {
  const {
    collections,
    updateCollection,
    addItem,
    deleteItem,
    updateItemOrder,
    updateItem,
  } = useCollections()
  const collection = collections[collectionId]

  return {
    ...collection,
    update: (data: CollectionInput) =>
      updateCollection(collectionId, () => data),
    addItem: (item: RawItem) => addItem(collectionId, item),
    deleteItem: (itemId: ItemId) => deleteItem(collectionId, itemId),
    updateItem: (itemId: ItemId, item: RawItem) =>
      updateItem(collectionId, itemId, item),
    updateItemOrder: (itemOrder: ItemId[]) =>
      updateItemOrder(collectionId, itemOrder),
    getItem: (itemId: ItemId) => collection.items[itemId],
    getItemIndex: (itemId: ItemId) => collection.itemOrder.indexOf(itemId),
  }
}
