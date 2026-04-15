import { useEffect, useLayoutEffect, useState } from "react"
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"

import { useNavigation } from "expo-router"

import { ItemId, RawFieldAndValue, WithMeta } from "@/types"
import AppText from "@/components/AppText"
import { HeaderButton } from "@/components/HeaderButton"
import ItemFormModal from "@/components/ItemFormModal"
import ScreenMessage from "@/components/ScreenMessage"
import { useCollections } from "@/context/CollectionsContext"
import { useItemRoute } from "@/hooks/useRouteEntities"
import { collectionDetailStyles, colors, spacing } from "@/styles"
import { fieldService } from "@/services/fieldService"

export default function ItemDetailScreen() {
  const route = useItemRoute()
  const navigation = useNavigation()
  const { updateItem } = useCollections()
  const [currentIndex, setCurrentIndex] = useState(route?.itemIndex ?? 0)

  const screenWidth = Dimensions.get("window").width
  const notFoundView = (
    <ScreenMessage
      message="Item not found"
      containerStyle={collectionDetailStyles.container}
    />
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route?.collection.name ?? "Item Details",
      headerRight: route
        ? () => (
            <HeaderButton
              iconName="pencil"
              onPress={() => setItemModalVisible(true)}
            />
          )
        : undefined,
    })
  }, [navigation, route?.collection.name])

  const [itemModalVisible, setItemModalVisible] = useState(false)

  useEffect(() => {
    if (route) {
      setCurrentIndex(route.itemIndex)
    }
  }, [route?.itemId, route?.itemIndex])

  const maxIndex = route ? route.collection.itemOrder.length - 1 : 0
  const safeCurrentIndex = route ? Math.min(currentIndex, maxIndex) : currentIndex

  useEffect(() => {
    if (route && safeCurrentIndex !== currentIndex) {
      setCurrentIndex(safeCurrentIndex)
    }
  }, [currentIndex, route?.itemId, safeCurrentIndex])

  if (!route) return notFoundView

  const { collection, collectionId } = route
  const { fields, fieldOrder, itemOrder } = collection
  const currentItemId = itemOrder[safeCurrentIndex]
  const currentItem = currentItemId ? collection.items[currentItemId] : undefined

  if (!currentItemId || !currentItem) return notFoundView

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const newIndex = Math.round(
      e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width,
    )
    setCurrentIndex(newIndex)
  }

  const renderItem = ({ item: currentItemId }: { item: ItemId }) => {
    const item = collection.items[currentItemId]
    if (!item) return null

    return (
      <View style={[styles.itemPage, { width: screenWidth }]}>
        <ScrollView contentContainerStyle={styles.container}>
          {fieldOrder.map(fieldId => {
            const value = item.values[fieldId]
            if (value === undefined) return null
            const field = fields[fieldId]
            const fieldWithValue = {
              ...field,
              value,
            } as WithMeta<RawFieldAndValue>

            return (
              <View key={fieldId} style={styles.fieldRow}>
                <AppText weight="bold" style={styles.label}>
                  {fieldWithValue.name}
                </AppText>
                {fieldService.display(fieldWithValue)}
              </View>
            )
          })}
        </ScrollView>
      </View>
    )
  }

  return (
    <>
      <FlatList
        data={itemOrder}
        horizontal
        pagingEnabled
        keyExtractor={id => id}
        initialScrollIndex={route.itemIndex}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        windowSize={7}
        maxToRenderPerBatch={4}
        removeClippedSubviews={false}
        renderItem={renderItem}
      />

      <ItemFormModal
        mode="edit"
        visible={itemModalVisible}
        fieldOrder={fieldOrder}
        fields={fields}
        initialValues={currentItem.values}
        onSubmit={values => {
          updateItem(collectionId, currentItemId, { values })
          setItemModalVisible(false)
        }}
        onDiscard={() => setItemModalVisible(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  itemPage: {
    width: "100%",
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    color: colors.textLabel,
    maxWidth: "40%",
    flexShrink: 1,
  },
})
