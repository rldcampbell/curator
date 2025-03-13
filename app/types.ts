type CollectionId = `c${number}`
type FieldId = `f${number}`
type ItemId = `i${number}`

type DateArray = [y: number, m: number, d: number]

type BaseField = {
  id: FieldId
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

type Item = {
  id: ItemId
  fieldValues: Record<FieldId, any>
}

type Collection = {
  id: CollectionId
  name: string
  fieldOrder: FieldId[]
  fields: Record<FieldId, Field>
  itemOrder: ItemId[]
  items: Record<ItemId, Item>
}
