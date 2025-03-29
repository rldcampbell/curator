import { View, Button, ScrollView } from "react-native"
import { router } from "expo-router"
import collectionsData from "../data.json" with { type: "json" }
import { CollectionsData } from "../types.js"

const { collectionOrder, collections } =
  collectionsData as unknown as CollectionsData

export default function CollectionsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ScrollView style={{ width: "100%" }}>
        {/* Add Collection Button */}
        <Button
          title="+ Add New Collection"
          onPress={() => router.push("/new-collection")}
        />

        {/* Existing Collections */}
        {collectionOrder.map(collectionId => {
          const collection = collections[collectionId]

          return (
            <Button
              key={collectionId}
              title={collection.name}
              onPress={() => router.push(`/(collections)/${collectionId}`)}
            />
          )
        })}
      </ScrollView>
    </View>
  )
}
