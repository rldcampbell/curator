import { View, Text, Pressable, ScrollView } from "react-native"
import { router } from "expo-router"
import { sharedStyles } from "@/styles/sharedStyles"
import { useCollections } from "@/context/CollectionsContext"

export default function CollectionsScreen() {
  const { collections, collectionOrder } = useCollections()

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
