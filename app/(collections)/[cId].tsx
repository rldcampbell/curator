import { useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"

import { router, useLocalSearchParams } from "expo-router"

import { CollectionId, ItemId } from "@/app/types"
import AddButton from "@/components/AddButton"
import CreateItemModal from "@/components/CreateItemModal"
import { useCollection } from "@/hooks/useCollection"
import { collectionDetailStyles } from "@/styles/collectionDetailStyles"
import { sharedStyles } from "@/styles/sharedStyles"

export default function CollectionDetailScreen() {
  const { cId } = useLocalSearchParams()
  const collectionId = cId as CollectionId
  const {
    addItem,
    fieldOrder,
    fields,
    itemOrder,
    items,
    name,
    updateItemOrder,
  } = useCollection(collectionId)

  const [itemModalVisible, setItemModalVisible] = useState(false)

  if (!name) {
    return (
      <View style={collectionDetailStyles.container}>
        <Text style={sharedStyles.errorText}>Collection not found</Text>
      </View>
    )
  }

  return (
    <View style={collectionDetailStyles.container}>
      <View style={collectionDetailStyles.header}>
        <AddButton onPress={() => setItemModalVisible(true)} />
      </View>

      <DraggableFlatList
        data={itemOrder}
        keyExtractor={item => item}
        onDragEnd={({ data }) => updateItemOrder([...data])}
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
            <Text style={sharedStyles.cardText}>
              {items[item]?.[fieldOrder[0]]?.toString() || "Untitled Item"}
            </Text>
          </TouchableOpacity>
        )}
      />
      {itemModalVisible && (
        <CreateItemModal
          visible={itemModalVisible}
          fieldOrder={fieldOrder}
          fields={fields}
          onCreate={inputValues => {
            addItem(inputValues)
            setItemModalVisible(false)
          }}
          onDiscard={() => setItemModalVisible(false)}
        />
      )}
    </View>
  )
}
