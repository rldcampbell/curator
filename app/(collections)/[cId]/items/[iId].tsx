import { FlatList, Text, View } from "react-native"
import {
  GestureEvent,
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler"

import { useLocalSearchParams, useRouter } from "expo-router"

import { CollectionId, CollectionsData, FieldId, ItemId } from "@/app/types"
import { safeAccess } from "@/helpers"

export default function ItemDetailScreen() {
  const { cId, iId } = useLocalSearchParams()

  const collectionId = cId as unknown as CollectionId
  const itemId = iId as unknown as ItemId
  const { collections } = collectionData as unknown as CollectionsData

  const router = useRouter()

  console.log(collectionId)

  const collection = collections[collectionId]
  const { itemOrder } = collection
  const itemIndex = itemOrder.indexOf(itemId)
  const itemData = collection.items[itemId]

  const goToItem = (newIndex: number) => {
    router.replace(`/${collectionId}/items/${safeAccess(itemOrder, newIndex)}`)
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={(
          event: GestureEvent<PanGestureHandlerEventPayload>,
        ) => {
          const { translationX } = event.nativeEvent
          if (translationX < -50) goToItem(itemIndex + 1)
          if (translationX > 50) goToItem(itemIndex - 1)
        }}
      >
        <View style={{ flex: 1, padding: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            {collection.name}
          </Text>
          <FlatList
            data={Object.entries(itemData)}
            keyExtractor={([key]) => key}
            renderItem={({ item: [fieldId, value] }) => (
              <Text>
                <Text style={{ fontWeight: "bold" }}>
                  {collection.fields[fieldId as unknown as FieldId].name}:{" "}
                </Text>
                {value}
              </Text>
            )}
          />
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  )
}
