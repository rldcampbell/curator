import { useLayoutEffect, useState } from "react"
import { Animated, View } from "react-native"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"

import * as Haptics from "expo-haptics"
import { router, useNavigation } from "expo-router"
import { useLocalSearchParams } from "expo-router"

import { Feather } from "@expo/vector-icons"

import { CollectionId, ItemId, RawItem } from "@/app/types"
import AppText from "@/components/AppText"
import ConfirmModal from "@/components/ConfirmModal"
import { HeaderButton } from "@/components/HeaderButton"
import ItemFormModal from "@/components/ItemFormModal"
import MetaBar from "@/components/MetaBar"
import SwaggableRow from "@/components/SwaggableRow"
import { useCollection } from "@/hooks/useCollection"
import { collectionDetailStyles } from "@/styles/collectionDetailStyles"
import { sharedStyles } from "@/styles/sharedStyles"

export default function CollectionDetailScreen() {
  const { cId } = useLocalSearchParams()
  const collectionId = cId as CollectionId
  const {
    addItem,
    deleteItem,
    updateItem,
    fieldOrder,
    fields,
    itemOrder,
    items,
    name,
    updateItemOrder,
    _meta,
  } = useCollection(collectionId)

  const [itemModalVisible, setItemModalVisible] = useState(false)
  const [editingItemId, setEditingItemId] = useState<ItemId | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<ItemId | null>(null)

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
        <AppText style={sharedStyles.errorText}>Collection not found</AppText>
      </View>
    )
  }

  const handleItemSubmit = (item: RawItem) => {
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
      {/* Sticky Meta Bar */}
      <MetaBar updatedAt={_meta.updatedAt} itemCount={itemOrder.length} />

      {/* Item List */}
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
              icon: <Feather name="edit-3" size={20} color="black" />,
              onPress: (itemId: ItemId) => {
                setEditingItemId(itemId)
                setItemModalVisible(true)
              },
            },
            {
              icon: <Feather name="trash-2" size={20} color="black" />,
              onPress: (itemId: ItemId) => {
                setDeleteItemId(itemId)
              },
              backgroundColor: "#e74c3c",
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
                router.push({
                  pathname: "/collections/[cId]/items/[iId]",
                  params: {
                    cId: collectionId,
                    iId: item,
                  },
                })
              }
              buttons={buttons}
              renderContent={() => (
                <Animated.View
                  style={{
                    backgroundColor: isActive ? "#d0ebff" : "#fff",
                    padding: 16,
                  }}
                >
                  <AppText style={collectionDetailStyles.itemText}>
                    {value}
                  </AppText>
                </Animated.View>
              )}
            />
          )
        }}
      />

      <ConfirmModal
        visible={!!deleteItemId}
        title="Delete item?"
        message="Are you sure you want to permanently delete this item?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (deleteItemId) {
            deleteItem(deleteItemId)
            setDeleteItemId(null)
          }
        }}
        onCancel={() => setDeleteItemId(null)}
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
