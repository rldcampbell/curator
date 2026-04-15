import { isCollectionId, isItemId } from "@/helpers/id"
import { Collection, CollectionId, CollectionsData, Item, ItemId } from "@/types"

export type RouteParam = string | string[] | undefined
export type CollectionRouteParams = { cId?: RouteParam }
export type ItemRouteParams = CollectionRouteParams & { iId?: RouteParam }

export type CollectionRoute = {
  collectionId: CollectionId
  collection: Collection
}

export type ItemRoute = CollectionRoute & {
  item: Item
  itemId: ItemId
  itemIndex: number
}

const getSingleRouteParam = (value: RouteParam): string | undefined =>
  typeof value === "string" ? value : undefined

const getCollectionIdParam = (value: RouteParam): CollectionId | null => {
  const param = getSingleRouteParam(value)
  return param && isCollectionId(param) ? param : null
}

const getItemIdParam = (value: RouteParam): ItemId | null => {
  const param = getSingleRouteParam(value)
  return param && isItemId(param) ? param : null
}

export function resolveCollectionRoute(
  params: CollectionRouteParams,
  collections: CollectionsData["collections"],
): CollectionRoute | null {
  const collectionId = getCollectionIdParam(params.cId)
  if (!collectionId) return null

  const collection = collections[collectionId]
  if (!collection) return null

  return {
    collectionId,
    collection,
  }
}

export function resolveItemRoute(
  params: ItemRouteParams,
  collections: CollectionsData["collections"],
): ItemRoute | null {
  const collectionRoute = resolveCollectionRoute(params, collections)
  const itemId = getItemIdParam(params.iId)

  if (!collectionRoute || !itemId) return null

  const item = collectionRoute.collection.items[itemId]
  const itemIndex = collectionRoute.collection.itemOrder.indexOf(itemId)

  if (!item || itemIndex < 0) return null

  return {
    ...collectionRoute,
    item,
    itemId,
    itemIndex,
  }
}
