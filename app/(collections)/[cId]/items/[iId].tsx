import { FlatList, Text, View } from "react-native"
import {
  GestureEvent,
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler"

import { useLocalSearchParams, useRouter } from "expo-router"

import { CollectionId, FieldId, FieldValue, ItemId } from "@/app/types"
import { safeAccess } from "@/helpers"
import { useCollection } from "@/hooks/useCollection"

export default function ItemDetailScreen() {
  const { cId, iId } = useLocalSearchParams()

  const collectionId = cId as unknown as CollectionId
  const itemId = iId as unknown as ItemId

  const router = useRouter()

  const { getItem, getItemIndex, itemOrder, name, fields } =
    useCollection(collectionId)
  const itemIndex = getItemIndex(itemId)
  const itemData = getItem(itemId)

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
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>{name}</Text>
          <FlatList
            data={Object.entries(itemData) as [FieldId, FieldValue][]}
            keyExtractor={([key]) => key}
            renderItem={({ item: [fieldId, value] }) => (
              <Text>
                <Text style={{ fontWeight: "bold" }}>
                  {fields[fieldId].name}:{" "}
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
