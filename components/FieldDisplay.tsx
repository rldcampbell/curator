import { View } from "react-native"

import {
  Collection,
  DateArray,
  Field,
  FieldType,
  FieldValue,
  ItemId,
} from "../app/types"
import styles from "../styles/FieldDisplayStyles"
import AppText from "./AppText"

// Import the styles

type FieldDisplayProps = {
  itemId: ItemId
  collection: Collection
}

export default function FieldDisplay({
  itemId,
  collection,
}: FieldDisplayProps) {
  const item = collection.items[itemId]

  const fieldEntries = collection.fieldOrder.slice(0, 2).map(fieldId => ({
    name: collection.fields[fieldId].name,
    value: format(collection.fields[fieldId], item[fieldId]),
  }))

  return (
    <View style={styles.container}>
      {fieldEntries.map(({ name, value }) => (
        <View key={name} style={styles.fieldRow}>
          <AppText weight="bold">{name}:</AppText>
          <AppText style={styles.value}>{String(value)}</AppText>
        </View>
      ))}
    </View>
  )
}

const format = (field: Field, value: FieldValue) => {
  if (field.type === FieldType.Number) {
    return formatNumber(value as number)
  }

  if (field.type === FieldType.Date) {
    return formatDate(value as DateArray)
  }

  return value
}

// Function to format numbers with commas
const formatNumber = (value: number) => value.toLocaleString()

// Function to format dates
const formatDate = ([y, m, d]: DateArray) => {
  const date = new Date(Date.UTC(y, m - 1, d))

  return date.toLocaleDateString() // Customize the format if needed
}
