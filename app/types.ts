export type RawId = `${string}-${string}-${string}-${string}` // future: https://github.com/microsoft/TypeScript/issues/41160

export type CollectionId = `c-${RawId}`
export type FieldId = `f-${RawId}`
export type ItemId = `i-${RawId}`

export type DateArray = [y: number, m: number, d: number]

/** Epoch ms */
export type Timestamp = number

export const FieldType = {
  Text: "text",
  Number: "number",
  Date: "date",
  Image: "image",
} as const

export type FieldType = (typeof FieldType)[keyof typeof FieldType]

export type FieldValueMap = {
  [FieldType.Text]: string
  [FieldType.Number]: number
  [FieldType.Date]: DateArray
  [FieldType.Image]: string[]
}

export type FieldValue = FieldValueMap[FieldType]

export type Meta = {
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type WithMeta<T, MetaType = Meta> = T & { _meta: MetaType }

type RawBaseField = {
  name: string
}

type RawTextFieldAndValue = RawBaseField & {
  type: typeof FieldType.Text
  value?: FieldValueMap[typeof FieldType.Text]
  charLim?: number
}

type RawNumberFieldAndValue = RawBaseField & {
  type: typeof FieldType.Number
  value?: FieldValueMap[typeof FieldType.Number]
  min?: number
  max?: number
  // format?: NumberFormat // TODO: determine what this should look like - scientific, SF, DP etc. etc.
}

type RawDateFieldAndValue = RawBaseField & {
  type: typeof FieldType.Date
  value?: FieldValueMap[typeof FieldType.Date]
  min?: DateArray
  max?: DateArray
}

type RawImageFieldAndValue = RawBaseField & {
  type: typeof FieldType.Image
  value?: FieldValueMap[typeof FieldType.Image]
  max?: number // future: UI might restrict how many images can be selected
}

export type RawFieldAndValue =
  | RawTextFieldAndValue
  | RawNumberFieldAndValue
  | RawDateFieldAndValue
  | RawImageFieldAndValue

type OmitFromUnion<T, K extends keyof any> = T extends any ? Omit<T, K> : never

export type RawField = OmitFromUnion<RawFieldAndValue, "value">
export type Field = WithMeta<RawField>

export type RawItem = Record<FieldId, FieldValue>
export type Item = WithMeta<RawItem>

export type RawCollection = {
  name: string
  fieldOrder: FieldId[]
  fields: Record<FieldId, RawField>
  itemOrder: ItemId[]
  items: Record<ItemId, RawItem>
}

export type Collection = WithMeta<{
  name: string
  fieldOrder: FieldId[]
  fields: Record<FieldId, Field>
  itemOrder: ItemId[]
  items: Record<ItemId, Item>
}>

export type CollectionsData = {
  collectionOrder: CollectionId[]
  collections: Record<CollectionId, Collection>
}
