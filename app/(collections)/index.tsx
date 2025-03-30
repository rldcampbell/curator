import { View, Text, Pressable, ScrollView } from "react-native"
import { router } from "expo-router"
import collectionsData from "../data.json" with { type: "json" }
import { CollectionsData } from "../types.js"
import { sharedStyles } from "@/styles/sharedStyles"

const { collectionOrder, collections } =
  collectionsData as unknown as CollectionsData

export default function CollectionsScreen() {
  return (
    <View style={sharedStyles.container}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContainer}>
        {/* Add New Collection Card */}
        <Pressable
          style={[sharedStyles.card, sharedStyles.addCard]}
          onPress={() => router.push("/add-collection")}
        >
          <Text style={sharedStyles.addText}>＋</Text>
        </Pressable>

        {/* Collection Cards */}
        {collectionOrder.map(collectionId => {
          const collection = collections[collectionId]

          return (
            <Pressable
              key={collectionId}
              style={sharedStyles.card}
              onPress={() => router.push(`/(collections)/${collectionId}`)}
            >
              <Text style={sharedStyles.cardText}>{collection.name}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
