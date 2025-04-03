import { useLayoutEffect, useState } from "react"
import { Animated, Text, View } from "react-native"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"

import * as Haptics from "expo-haptics"
import { router, useNavigation } from "expo-router"
import { useLocalSearchParams } from "expo-router"

import { Feather } from "@expo/vector-icons"

import { CollectionId, Item, ItemId } from "@/app/types"
import { HeaderButton } from "@/components/HeaderButton"
import ItemFormModal from "@/components/ItemFormModal"
import SwaggableRow from "@/components/SwaggableRow"
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

          const buttons = [
            {
              icon: <Feather name="trash-2" size={20} color="black" />,
              onPress: (itemId: ItemId) =>
                console.log("🗑️ Delete item:", itemId),
              backgroundColor: "#e74c3c",
            },
            {
              icon: <Feather name="edit-3" size={20} color="black" />,
              onPress: (itemId: ItemId) => {
                console.log("✏️ Edit item:", itemId)
                setEditingItemId(itemId)
                setItemModalVisible(true)
              },
            },
          ]

          return (
            <SwaggableRow
              item={item}
              onDrag={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                drag()
              }}
              onPress={() =>
                router.push(`/(collections)/${collectionId}/items/${item}`)
              }
              buttons={buttons}
              renderContent={() => (
                <Animated.View
                  style={{
                    backgroundColor: isActive ? "#d0ebff" : "#fff",
                    padding: 16,
                  }}
                >
                  <Text style={collectionDetailStyles.itemText}>{value}</Text>
                </Animated.View>
              )}
            />
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
