import { View, Text, Pressable } from "react-native"
import { useRouter } from "expo-router"
import {
  Collection,
  CollectionId,
  DateArray,
  Field,
  FieldValue,
  ItemId,
} from "../app/types"
import styles from "../styles/FieldDisplayStyles" // Import the styles

type FieldDisplayProps = {
  collectionId: CollectionId
  itemId: ItemId
  collection: Collection
}

export default function FieldDisplay({
  collectionId,
  itemId,
  collection,
}: FieldDisplayProps) {
  const router = useRouter()
  const item = collection.items[itemId]

  // Get the first 2 fields to display
  const fieldEntries = collection.fieldOrder.slice(0, 2).map(fieldId => ({
    name: collection.fields[fieldId].name,
    value: format(collection.fields[fieldId], item[fieldId]),
  }))

  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        router.push(`/(collections)/${collectionId}/items/${itemId}`)
      }
    >
      {fieldEntries.map(({ name, value }) => (
        <View key={name} style={styles.fieldRow}>
          <Text style={styles.label}>{name}:</Text>
          <Text style={styles.value}>{String(value)}</Text>
        </View>
      ))}
    </Pressable>
  )
}

const format = (field: Field, value: FieldValue) => {
  if (field.type === "number") {
    return formatNumber(value as number)
  }

  if (field.type === "date") {
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
