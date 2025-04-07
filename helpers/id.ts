import { CollectionId, FieldId, ItemId } from "@/app/types"

const BASE62 = "[A-Za-z0-9]"
const BASE62BLOCK = `${BASE62}{4}`
const ID_SUFFIX = `${BASE62BLOCK}-${BASE62BLOCK}-${BASE62BLOCK}-${BASE62BLOCK}`

const COLLECTION_ID_REGEX = new RegExp(`^c-${ID_SUFFIX}$`)
const ITEM_ID_REGEX = new RegExp(`^i-${ID_SUFFIX}$`)
const FIELD_ID_REGEX = new RegExp(`^f-${ID_SUFFIX}$`)

export function isCollectionId(id: string): id is CollectionId {
  return COLLECTION_ID_REGEX.test(id)
}

export function isItemId(id: string): id is ItemId {
  return ITEM_ID_REGEX.test(id)
}

export function isFieldId(id: string): id is FieldId {
  return FIELD_ID_REGEX.test(id)
}
