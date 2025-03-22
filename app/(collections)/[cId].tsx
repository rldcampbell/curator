import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { collections } from "../data.json" with { type: "json" }
import { Collection, CollectionId, ItemId } from "../types.js"
import FieldDisplay from "../../components/FieldDisplay"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"
import { useState } from "react"

export default function CollectionDetailScreen() {
  const { cId } = useLocalSearchParams() // Get collection ID from URL
  const collectionId = cId as unknown as CollectionId
  const collection = (collections as unknown as Record<string, Collection>)[
    collectionId as any
  ]

  const [itemOrder, setItemOrder] = useState(collection?.itemOrder || [])

  if (!collection) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Collection not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{collection.name}</Text>
      <DraggableFlatList
        data={itemOrder}
        keyExtractor={item => item}
        onDragEnd={({ data }) => setItemOrder(data)}
        renderItem={({ item, drag, isActive }: RenderItemParams<string>) => {
          return (
            <TouchableOpacity
              key={item}
              style={[styles.itemCard, isActive ? styles.activeItemCard : null]}
              onLongPress={drag} // Enable dragging when long-pressed
            >
              <FieldDisplay
                collectionId={collectionId}
                itemId={item as ItemId}
                collection={collection}
              />
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  activeItemCard: {
    backgroundColor: "#e0e0e0", // Change color when dragging
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
})
