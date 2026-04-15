import { useEffect, useLayoutEffect, useState } from "react"
import { Animated, StyleSheet, View } from "react-native"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"

import * as Haptics from "expo-haptics"
import { router, useNavigation } from "expo-router"

import { Feather } from "@expo/vector-icons"

import { ItemId, RawItem } from "@/types"
import AppText from "@/components/AppText"
import ConfirmModal from "@/components/ConfirmModal"
import { HeaderButton } from "@/components/HeaderButton"
import ItemFormModal from "@/components/ItemFormModal"
import MetaBar from "@/components/MetaBar"
import ScreenMessage from "@/components/ScreenMessage"
import SwaggableRow from "@/components/SwaggableRow"
import { useCollections } from "@/context/CollectionsContext"
import { useCollectionRoute } from "@/hooks/useRouteEntities"
import { collectionDetailStyles, colors, spacing } from "@/styles"

export default function CollectionDetailScreen() {
  const route = useCollectionRoute()
  const {
    addItem,
    deleteItem,
    updateItem,
    updateItemOrder,
  } = useCollections()

  const [itemModalVisible, setItemModalVisible] = useState(false)
  const [editingItemId, setEditingItemId] = useState<ItemId | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<ItemId | null>(null)
  const editingItem =
    route && editingItemId ? route.collection.items[editingItemId] : undefined

  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: route
        ? () => (
            <HeaderButton
              iconName="add"
              onPress={() => setItemModalVisible(true)}
            />
          )
        : undefined,
      title: route?.collection.name ?? "Collection",
    })
  }, [navigation, route?.collection.name])

  useEffect(() => {
    if (editingItemId && !editingItem) {
      setEditingItemId(null)
      setItemModalVisible(false)
    }
  }, [editingItem, editingItemId])

  if (!route) {
    return (
      <ScreenMessage
        message="Collection not found"
        containerStyle={collectionDetailStyles.container}
      />
    )
  }

  const { collection, collectionId } = route
  const { fieldOrder, fields, itemOrder, items, _meta } = collection

  const handleItemValuesSubmit = (values: RawItem["values"]) => {
    if (editingItemId && editingItem) {
      updateItem(collectionId, editingItemId, { values })
    } else {
      addItem(collectionId, { values })
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
        onDragEnd={({ data }) => updateItemOrder(collectionId, [...data])}
        contentContainerStyle={collectionDetailStyles.listContainer}
        renderItem={({ item, drag, isActive }: RenderItemParams<ItemId>) => {
          const value =
            items[item]?.values?.[fieldOrder[0]]?.toString() || "Untitled Item"

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
                  style={[
                    styles.rowContent,
                    isActive ? styles.rowContentActive : undefined,
                  ]}
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
            deleteItem(collectionId, deleteItemId)
            setDeleteItemId(null)
          }
        }}
        onCancel={() => setDeleteItemId(null)}
      />

      {itemModalVisible && (
        <ItemFormModal
          mode={editingItem ? "edit" : "create"}
          visible={itemModalVisible}
          fieldOrder={fieldOrder}
          fields={fields}
          initialValues={editingItem?.values}
          onSubmit={handleItemValuesSubmit}
          onDiscard={handleItemDiscard}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  rowContent: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  rowContentActive: {
    backgroundColor: "#d0ebff",
  },
})
