import { View, Text, TouchableOpacity } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { useCollection } from "@/hooks/useCollection"
import { collectionDetailStyles } from "@/styles/collectionDetailStyles"
import { sharedStyles } from "@/styles/sharedStyles"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"
import { CollectionId, ItemId } from "@/app/types"
import AddButton from "@/components/AddButton"

export default function CollectionDetailScreen() {
  const { cId } = useLocalSearchParams()
  const collectionId = cId as CollectionId
  const collection = useCollection(collectionId)

  const [itemOrder, setItemOrder] = useState<ItemId[]>(
    collection?.itemOrder || [],
  )

  if (!collection) {
    return (
      <View style={collectionDetailStyles.container}>
        <Text style={sharedStyles.errorText}>Collection not found</Text>
      </View>
    )
  }

  return (
    <View style={collectionDetailStyles.container}>
      <View style={collectionDetailStyles.header}>
        <AddButton onPress={() => {}} />
      </View>

      <DraggableFlatList
        data={itemOrder}
        keyExtractor={item => item}
        onDragEnd={({ data }) => setItemOrder([...data])}
        contentContainerStyle={collectionDetailStyles.listContainer}
        renderItem={({ item, drag, isActive }: RenderItemParams<ItemId>) => (
          <TouchableOpacity
            key={item}
            style={[
              sharedStyles.card,
              isActive ? sharedStyles.activeCard : null,
            ]}
            onLongPress={drag}
            delayLongPress={300}
            onPress={() =>
              router.push(`/(collections)/${collectionId}/items/${item}`)
            }
          >
            <Text style={sharedStyles.cardText}>Item: {item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}
