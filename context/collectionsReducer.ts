import {
  Collection,
  CollectionId,
  CollectionsData,
  Item,
  ItemId,
} from "@/app/types"

export type CollectionsAction =
  | {
      type: "set_collections_data"
      data: CollectionsData
    }
  | {
      type: "add_collection"
      collectionId: CollectionId
      collection: Collection
    }
  | {
      type: "update_collection"
      collectionId: CollectionId
      collection: Collection
    }
  | {
      type: "delete_collection"
      collectionId: CollectionId
    }
  | {
      type: "update_collection_order"
      collectionOrder: CollectionId[]
    }
  | {
      type: "add_item"
      collectionId: CollectionId
      itemId: ItemId
      item: Item
    }
  | {
      type: "update_item"
      collectionId: CollectionId
      itemId: ItemId
      item: Item
    }
  | {
      type: "delete_item"
      collectionId: CollectionId
      itemId: ItemId
      timestamp: number
    }
  | {
      type: "update_item_order"
      collectionId: CollectionId
      itemOrder: ItemId[]
    }

export const collectionsReducer = (
  state: CollectionsData,
  action: CollectionsAction,
): CollectionsData => {
  switch (action.type) {
    case "set_collections_data": {
      return action.data
    }

    case "add_collection": {
      return {
        collections: {
          ...state.collections,
          [action.collectionId]: action.collection,
        },
        collectionOrder: [...state.collectionOrder, action.collectionId],
      }
    }

    case "update_collection": {
      const existingCollection = state.collections[action.collectionId]
      if (!existingCollection) return state

      return {
        ...state,
        collections: {
          ...state.collections,
          [action.collectionId]: action.collection,
        },
      }
    }

    case "delete_collection": {
      const collections = { ...state.collections }
      delete collections[action.collectionId]
      return {
        collections,
        collectionOrder: state.collectionOrder.filter(
          id => id !== action.collectionId,
        ),
      }
    }

    case "update_collection_order": {
      return {
        ...state,
        collectionOrder: action.collectionOrder,
      }
    }

    case "add_item": {
      const collection = state.collections[action.collectionId]
      if (!collection) return state

      return {
        ...state,
        collections: {
          ...state.collections,
          [action.collectionId]: {
            ...collection,
            itemOrder: [...collection.itemOrder, action.itemId],
            items: {
              ...collection.items,
              [action.itemId]: {
                ...action.item,
              },
            },
            // DO update _meta
            _meta: {
              ...collection._meta,
              updatedAt: action.item._meta.updatedAt,
            },
          },
        },
      }
    }

    case "update_item": {
      const collection = state.collections[action.collectionId]
      if (!collection) return state

      const existingItem = collection.items[action.itemId]
      if (!existingItem) return state

      return {
        ...state,
        collections: {
          ...state.collections,
          [action.collectionId]: {
            ...collection,
            items: {
              ...collection.items,
              [action.itemId]: action.item,
            },
            // don't update collection _meta
          },
        },
      }
    }

    case "delete_item": {
      const collection = state.collections[action.collectionId]
      if (!collection) return state

      const items = { ...collection.items }
      delete items[action.itemId]

      return {
        ...state,
        collections: {
          ...state.collections,
          [action.collectionId]: {
            ...collection,
            items,
            itemOrder: collection.itemOrder.filter(id => id !== action.itemId),
            // DO update _meta
            _meta: {
              ...collection._meta,
              updatedAt: action.timestamp,
            },
          },
        },
      }
    }

    case "update_item_order": {
      const collection = state.collections[action.collectionId]
      if (!collection) return state

      return {
        ...state,
        collections: {
          ...state.collections,
          [action.collectionId]: {
            ...collection,
            itemOrder: action.itemOrder,
            // don't update _meta
          },
        },
      }
    }

    default:
      return state
  }
}
