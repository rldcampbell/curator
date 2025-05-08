import { useLayoutEffect, useRef, useState } from "react"
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"

import { useLocalSearchParams, useNavigation } from "expo-router"

import { CollectionId, ItemId, RawFieldAndValue, WithMeta } from "@/app/types"
import AppText from "@/components/AppText"
import { HeaderButton } from "@/components/HeaderButton"
import ItemFormModal from "@/components/ItemFormModal"
import { useCollection } from "@/hooks/useCollection"
import { fieldService } from "@/services/fieldService"

export default function ItemDetailScreen() {
  const { cId, iId } = useLocalSearchParams()

  const collectionId = cId as unknown as CollectionId
  const itemId = iId as unknown as ItemId

  const navigation = useNavigation()

  const {
    getItem,
    getItemIndex,
    itemOrder,
    name,
    fields,
    fieldOrder,
    updateItem,
  } = useCollection(collectionId)

  const initialIndex = getItemIndex(itemId)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const flatListRef = useRef<FlatList<ItemId>>(null)
  const screenWidth = Dimensions.get("window").width

  useLayoutEffect(() => {
    navigation.setOptions({
      title: name,
      headerRight: () => (
        <HeaderButton
          iconName="pencil"
          onPress={() => setItemModalVisible(true)}
        />
      ),
    })
  }, [navigation, name])

  const [itemModalVisible, setItemModalVisible] = useState(false)

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const newIndex = Math.round(
      e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width,
    )
    setCurrentIndex(newIndex)
  }

  const renderItem = ({ item: currentItemId }: { item: ItemId }) => {
    const item = getItem(currentItemId)
    return (
      <View style={{ width: screenWidth }}>
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
        ref={flatListRef}
        data={itemOrder}
        horizontal
        pagingEnabled
        keyExtractor={id => id}
        initialScrollIndex={initialIndex}
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
        initialValues={getItem(itemOrder[currentIndex]).values}
        onSubmit={values => {
          updateItem(itemOrder[currentIndex], { values })
          setItemModalVisible(false)
        }}
        onDiscard={() => setItemModalVisible(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    gap: 8,
  },
  label: { fontSize: 16, color: "#333", maxWidth: "40%", flexShrink: 1 },
})
