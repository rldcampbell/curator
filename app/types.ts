type RawId = `${string}-${string}-${string}-${string}` // future: https://github.com/microsoft/TypeScript/issues/41160

export type CollectionId = `c-${RawId}`
type FieldId = `f-${RawId}`
type ItemId = `i-${RawId}`

type DateArray = [y: number, m: number, d: number]

type BaseField = {
  name: string
}

type TextField = BaseField & {
  type: "text"
  charLim: number
}

type NumberField = BaseField & {
  type: "number"
  min?: number
  max?: number
  // format?: NumberFormat // TODO: determine what this should look like - scientific, SF, DP etc. etc.
}

type DateField = BaseField & {
  type: "date"
  min?: DateArray
  max?: DateArray
}

type Field = TextField | NumberField | DateField

type Item = Record<FieldId, any>

export type Collection = {
  name: string
  fieldOrder: FieldId[]
  fields: Record<FieldId, Field>
  itemOrder: ItemId[]
  items: Record<ItemId, Item>
}

export type CollectionsData = {
  collectionOrder: CollectionId[]
  collections: Record<CollectionId, Collection>
}
