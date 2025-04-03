import { useLayoutEffect, useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"

import { useNavigation } from "expo-router"
import { router, useLocalSearchParams } from "expo-router"

import { CollectionId, Item, ItemId } from "@/app/types"
import { HeaderButton } from "@/components/HeaderButton"
import ItemFormModal from "@/components/ItemFormModal"
import { useCollection } from "@/hooks/useCollection"
import { collectionDetailStyles } from "@/styles/collectionDetailStyles"
import { sharedStyles } from "@/styles/sharedStyles"

export default function CollectionDetailScreen() {
  const { cId } = useLocalSearchParams()
  const collectionId = cId as CollectionId
  const {
    addItem,
    updateItem,
    fieldOrder,
    fields,
    itemOrder,
    items,
    name,
    updateItemOrder,
  } = useCollection(collectionId)

  const [itemModalVisible, setItemModalVisible] = useState(false)
  const [editingItemId, setEditingItemId] = useState<ItemId | null>(null)

  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          iconName="add"
          onPress={() => setItemModalVisible(true)}
        />
      ),
      title: name,
    })
  }, [navigation, name])

  if (!name) {
    return (
      <View style={collectionDetailStyles.container}>
        <Text style={sharedStyles.errorText}>Collection not found</Text>
      </View>
    )
  }

  const handleItemSubmit = (item: Item) => {
    if (editingItemId) {
      updateItem(editingItemId, item)
    } else {
      addItem(item)
    }
    setEditingItemId(null)
    setItemModalVisible(false)
  }

  const handleItemDiscard = () => {
    setEditingItemId(null)
    setItemModalVisible(false)
  }

  return (
    <View style={collectionDetailStyles.container}>
      <DraggableFlatList
        data={itemOrder}
        keyExtractor={item => item}
        onDragEnd={({ data }) => updateItemOrder([...data])}
        contentContainerStyle={collectionDetailStyles.listContainer}
        renderItem={({ item, drag, isActive }: RenderItemParams<ItemId>) => {
          const value =
            items[item]?.[fieldOrder[0]]?.toString() || "Untitled Item"

          return (
            <TouchableOpacity
              key={item}
              style={[
                collectionDetailStyles.itemRow,
                isActive && collectionDetailStyles.activeItemRow,
              ]}
              onLongPress={drag}
              delayLongPress={300}
              onPress={() =>
                router.push(`/(collections)/${collectionId}/items/${item}`)
              }
            >
              <Text style={collectionDetailStyles.itemText}>{value}</Text>
            </TouchableOpacity>
          )
        }}
      />

      {itemModalVisible && (
        <ItemFormModal
          mode={editingItemId ? "edit" : "create"}
          visible={itemModalVisible}
          fieldOrder={fieldOrder}
          fields={fields}
          initialValues={editingItemId ? items[editingItemId] : undefined}
          onSubmit={handleItemSubmit}
          onDiscard={handleItemDiscard}
        />
      )}
    </View>
  )
}
