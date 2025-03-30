import { View, Text, Pressable, ScrollView } from "react-native"
import { router } from "expo-router"
import { sharedStyles } from "@/styles/sharedStyles"
import { useCollections } from "@/context/CollectionsContext"
import AddButton from "@/components/AddButton"

export default function CollectionsScreen() {
  const { collections, collectionOrder } = useCollections()

  return (
    <View style={sharedStyles.container}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContainer}>
        <AddButton onPress={() => router.push("/add-collection")} />

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
