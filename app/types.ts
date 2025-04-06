export type RawId = `${string}-${string}-${string}-${string}` // future: https://github.com/microsoft/TypeScript/issues/41160

export type CollectionId = `c-${RawId}`
export type FieldId = `f-${RawId}`
export type ItemId = `i-${RawId}`

export type DateArray = [y: number, m: number, d: number]

export const FieldType = {
  Text: "text",
  Number: "number",
  Date: "date",
} as const

export type FieldType = (typeof FieldType)[keyof typeof FieldType]

export type FieldValueMap = {
  [FieldType.Text]: string
  [FieldType.Number]: number
  [FieldType.Date]: DateArray
}

export type FieldValue = FieldValueMap[FieldType]

type BaseField = {
  name: string
}

type TextFieldAndValue = BaseField & {
  type: typeof FieldType.Text
  value: FieldValueMap[typeof FieldType.Text]
  charLim?: number
}

type NumberFieldAndValue = BaseField & {
  type: typeof FieldType.Number
  value: FieldValueMap[typeof FieldType.Number]
  min?: number
  max?: number
  // format?: NumberFormat // TODO: determine what this should look like - scientific, SF, DP etc. etc.
}

type DateFieldAndValue = BaseField & {
  type: typeof FieldType.Date
  value: FieldValueMap[typeof FieldType.Date]
  min?: DateArray
  max?: DateArray
}

export type FieldAndValue =
  | TextFieldAndValue
  | NumberFieldAndValue
  | DateFieldAndValue

type OmitFromUnion<T, K extends keyof any> = T extends any ? Omit<T, K> : never

export type Field = OmitFromUnion<FieldAndValue, "value">

export type Item = Record<FieldId, FieldValue>

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
