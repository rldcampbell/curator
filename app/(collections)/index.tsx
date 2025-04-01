import { Text, TouchableOpacity, View } from "react-native"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"

import { router } from "expo-router"

import { CollectionId } from "@/app/types"
import AddButton from "@/components/AddButton"
import { useCollections } from "@/context/CollectionsContext"
import { sharedStyles } from "@/styles/sharedStyles"

export default function CollectionsScreen() {
  const { collections, collectionOrder, updateCollectionOrder } =
    useCollections()

  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.scrollContainer}>
        <AddButton onPress={() => router.push("/add-collection")} />
      </View>

      <DraggableFlatList
        data={collectionOrder}
        keyExtractor={item => item}
        onDragEnd={({ data }) => updateCollectionOrder(data)}
        contentContainerStyle={sharedStyles.scrollContainer}
        renderItem={({
          item,
          drag,
          isActive,
        }: RenderItemParams<CollectionId>) => {
          const collection = collections[item]
          return (
            <TouchableOpacity
              key={item}
              style={[
                sharedStyles.card,
                isActive ? sharedStyles.activeCard : null,
              ]}
              onLongPress={drag}
              delayLongPress={300}
              onPress={() => router.push(`/(collections)/${item}`)}
            >
              <Text style={sharedStyles.cardText}>{collection.name}</Text>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}
