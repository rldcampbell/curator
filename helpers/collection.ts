import { FieldId } from "@/app/types"
import { CollectionInput } from "@/context/CollectionsContext"

export function changeSummary(
  original: CollectionInput,
  edited: CollectionInput,
): Record<keyof CollectionInput, boolean> & { any: boolean } {
  const result = {
    name: original.name !== edited.name,
    fields: false,
    fieldOrder: false,
    any: false,
  }

  const originalFieldIds = Object.keys(original.fields) as FieldId[]
  const editedFieldIds = Object.keys(edited.fields) as FieldId[]

  if (
    originalFieldIds.length !== editedFieldIds.length ||
    !originalFieldIds.every(id => edited.fields[id])
  ) {
    result.fields = true
  } else {
    for (const id of originalFieldIds) {
      const o = original.fields[id]
      const e = edited.fields[id]
      if (o.name !== e.name || o.type !== e.type) {
        result.fields = true

        break
      }
    }
  }

  if (
    original.fieldOrder.length !== edited.fieldOrder.length ||
    original.fieldOrder.some((id, idx) => edited.fieldOrder[idx] !== id)
  ) {
    result.fieldOrder = true
  }

  result.any = result.name || result.fields || result.fieldOrder

  return result
}
