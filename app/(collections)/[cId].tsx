import { View, Text, ScrollView, StyleSheet } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { collections } from "../data.json" with { type: "json" }
import { Collection, CollectionId } from "../types.js"
import FieldDisplay from "../../components/FieldDisplay"

export default function CollectionDetailScreen() {
  const { cId } = useLocalSearchParams() // Get collection ID from URL

  const collectionId = cId as unknown as CollectionId

  const collection = (collections as unknown as Record<string, Collection>)[
    collectionId as any
  ]

  if (!collection) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Collection not found</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{collection.name}</Text>
      {collection.itemOrder.map(itemId => {
        const item = collection.items[itemId]

        return (
          <View key={itemId} style={styles.itemCard}>
            {collection.fieldOrder.map(fieldId => {
              return (
                <FieldDisplay
                  key={fieldId}
                  collectionId={collectionId}
                  itemId={itemId}
                  collection={collection}
                />
              )
            })}
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  itemCard: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
})
