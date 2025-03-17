import { View, Text } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { collections } from "../data.json" with { type: "json" }
import { Collection } from "../types.js"

export default function CollectionDetailScreen() {
  const { id: collectionId } = useLocalSearchParams() // Get collection ID from URL

  const collection = (collections as unknown as Collection[])[
    collectionId as any
  ] as Collection

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Collection ID: {collectionId}</Text>
      {collection.itemOrder.map(itemId => {
        const fJson = JSON.stringify(
          collection.fieldOrder.reduce<Record<string, any>>((p, fieldId) => {
            p[collection.fields[fieldId].name] =
              collection.items[itemId][fieldId]

            return p
          }, {}),
          null,
          2,
        )

        return <Text>{fJson}</Text>
      })}
    </View>
  )
}
