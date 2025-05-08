import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"

import { format } from "date-fns"
import { unparse } from "papaparse"

import {
  FieldId,
  FieldType,
  FieldValueMap,
  ItemId,
  RawCollection,
  RawField,
  RawItem,
} from "@/app/types"
import { fieldRegistry } from "@/fieldRegistry"

export const collectionService = {
  /**
   * Converts a RawCollection to a CSV string using current field definitions
   */
  toCsv(collection: RawCollection): string {
    const fieldOrder = collectionService.getExportableFieldOrder(
      collection.fieldOrder,
      collection.fields,
    )
    const headers = collectionService.getCsvHeaders(
      fieldOrder,
      collection.fields,
    )
    const rows = collectionService.getCsvRows(
      fieldOrder,
      collection.itemOrder,
      collection.fields,
      collection.items,
    )

    return unparse({ fields: headers, data: rows })
  },

  getExportableFieldOrder(
    fieldOrder: FieldId[],
    fields: Record<FieldId, RawField>,
  ): FieldId[] {
    return fieldOrder.filter(id => fields[id]?.type !== FieldType.Image)
  },

  getCsvHeaders(
    fieldOrder: FieldId[],
    fields: Record<FieldId, RawField>,
  ): string[] {
    return fieldOrder.map(id => fields[id]?.name ?? id)
  },

  getCsvRows(
    fieldOrder: FieldId[],
    itemOrder: ItemId[],
    fields: Record<FieldId, RawField>,
    items: Record<ItemId, RawItem>,
  ): string[][] {
    return itemOrder.map(itemId =>
      collectionService.getCsvRow(fieldOrder, fields, items[itemId]),
    )
  },

  getCsvRow(
    fieldOrder: FieldId[],
    fields: Record<FieldId, RawField>,
    item: RawItem | undefined,
  ): string[] {
    return fieldOrder.map(fieldId => {
      const field = fields[fieldId]
      const rawValue = item?.values?.[fieldId]
      return collectionService.getCsvValue(field, rawValue)
    })
  },

  getCsvValue<T extends FieldType>(
    field: Extract<RawField, { type: T }> | undefined,
    rawValue: FieldValueMap[T] | undefined,
  ): string {
    if (!field) return ""

    const def = fieldRegistry[field.type]
    return def.toText(rawValue) ?? ""
  },

  async exportToCsvFile(collection: RawCollection) {
    const csv = collectionService.toCsv(collection)

    const timestamp = format(new Date(), "yyyy-MM-dd-HH-mm-ss")
    const filename = `${collection.name}-${timestamp}.csv`
    const fileUri = `${FileSystem.documentDirectory}${filename}`

    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    })

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Collection",
      })
    } else {
      console.warn("Sharing not available on this device")
    }
  },
}
