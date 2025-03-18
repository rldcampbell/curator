import { View, Text, Button, FlatList } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import collectionData from "../../../data.json"
import {
  GestureEvent,
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler"
import { CollectionId, CollectionsData, FieldId, ItemId } from "../../../types"

export default function ItemDetailScreen() {
  const { cId, iId } = useLocalSearchParams()

  const collectionId = cId as unknown as CollectionId
  const itemId = iId as unknown as ItemId
  const { collections } = collectionData as unknown as CollectionsData

  const router = useRouter()

  console.log(collectionId)

  const collection = collections[collectionId]
  const items = collection.itemOrder
  const itemIndex = items.indexOf(itemId)
  const itemData = collection.items[itemId]

  const goBack = () => router.back()
  const goToItem = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < items.length) {
      router.replace(`/${collectionId}/${items[newIndex]}`)
    }
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
          <Button title="Back to Collection" onPress={goBack} />
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Item Details</Text>
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
