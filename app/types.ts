import { HexColor } from "@/helpers/color"

export type RawId = `${string}-${string}-${string}-${string}` // future: https://github.com/microsoft/TypeScript/issues/41160

export type CollectionId = `c-${RawId}`
export type FieldId = `f-${RawId}`
export type ItemId = `i-${RawId}`

export type DateArray = [y: number, m: number, d: number]

export type DateTimeArray = [
  year?: number,
  month?: number,
  day?: number,
  hour?: number,
  minute?: number,
  second?: number,
  ms?: number,
]

type DateTimeParts = [
  year: boolean,
  month: boolean,
  day: boolean,
  hour: boolean,
  minute: boolean,
  second: boolean,
  ms: boolean,
]

/** Epoch ms */
export type Timestamp = number

export const FieldType = {
  Boolean: "boolean",
  Date: "date", // to deprecate
  DateTime: "datetime",
  Duration: "duration",
  Image: "image",
  Number: "number",
  Text: "text",
} as const

export type FieldType = (typeof FieldType)[keyof typeof FieldType]

export type FieldValueMap = {
  [FieldType.Boolean]: boolean
  [FieldType.Date]: DateArray
  [FieldType.DateTime]: DateTimeArray
  [FieldType.Duration]: DateTimeArray
  [FieldType.Image]: string[]
  [FieldType.Number]: number
  [FieldType.Text]: string
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

type RawBooleanFieldAndValue = RawBaseField & {
  type: typeof FieldType.Boolean
  value?: FieldValueMap[typeof FieldType.Boolean]
}

type RawDateFieldAndValue = RawBaseField & {
  type: typeof FieldType.Date
  value?: FieldValueMap[typeof FieldType.Date]
  min?: DateArray
  max?: DateArray
}

type RawDateTimeFieldAndValue = RawBaseField & {
  type: typeof FieldType.DateTime
  value?: FieldValueMap[typeof FieldType.DateTime]
  parts: DateTimeParts
}

type RawDurationFieldAndValue = RawBaseField & {
  type: typeof FieldType.Duration
  value?: FieldValueMap[typeof FieldType.Duration]
  parts: DateTimeParts
}

type RawImageFieldAndValue = RawBaseField & {
  type: typeof FieldType.Image
  value?: FieldValueMap[typeof FieldType.Image]
  max?: number // future: UI might restrict how many images can be selected
}

type RawNumberFieldAndValue = RawBaseField & {
  type: typeof FieldType.Number
  value?: FieldValueMap[typeof FieldType.Number]
  min?: number
  max?: number
  // format?: NumberFormat // TODO: determine what this should look like - scientific, SF, DP etc. etc.
}

type RawTextFieldAndValue = RawBaseField & {
  type: typeof FieldType.Text
  value?: FieldValueMap[typeof FieldType.Text]
  charLim?: number
}

export type RawFieldAndValue =
  | RawBooleanFieldAndValue
  | RawDateFieldAndValue
  | RawDateTimeFieldAndValue
  | RawDurationFieldAndValue
  | RawImageFieldAndValue
  | RawNumberFieldAndValue
  | RawTextFieldAndValue

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
  color?: HexColor
}

export type Collection = WithMeta<{
  name: string
  fieldOrder: FieldId[]
  fields: Record<FieldId, Field>
  itemOrder: ItemId[]
  items: Record<ItemId, Item>
  color?: HexColor
}>

export type CollectionsData = {
  collectionOrder: CollectionId[]
  collections: Record<CollectionId, Collection>
}

export type Resolvable<T> = [T] extends [Function]
  ? never
  : T | Promise<T> | (() => T | Promise<T>)

export type Resolved<T> = Exclude<Resolvable<T>, Function | Promise<any>>
