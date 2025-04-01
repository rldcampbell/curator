import { useState } from "react"
import { Switch, Text, TouchableOpacity, View } from "react-native"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"

import { router, useLocalSearchParams } from "expo-router"

import { CollectionId, Item, ItemId } from "@/app/types"
import AddButton from "@/components/AddButton"
import Divider from "@/components/Divider"
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

  const [editMode, setEditMode] = useState(false)
  const [itemModalVisible, setItemModalVisible] = useState(false)
  const [editingItemId, setEditingItemId] = useState<ItemId | null>(null)

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
      <View style={collectionDetailStyles.header}>
        <Text style={sharedStyles.label}>Edit Mode</Text>
        <Switch value={editMode} onValueChange={setEditMode} />
        {editMode && <AddButton onPress={() => setItemModalVisible(true)} />}
      </View>

      <Divider />

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
            onPress={() => {
              if (editMode) {
                setEditingItemId(item)
                setItemModalVisible(true)
              } else {
                router.push(`/(collections)/${collectionId}/items/${item}`)
              }
            }}
          >
            <Text style={sharedStyles.cardText}>
              {items[item]?.[fieldOrder[0]]?.toString() || "Untitled Item"}
            </Text>
          </TouchableOpacity>
        )}
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
