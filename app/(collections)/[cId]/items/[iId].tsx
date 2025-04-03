import { useLayoutEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import {
  GestureEvent,
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler"

import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"

import { CollectionId, FieldAndValue, ItemId } from "@/app/types"
import { HeaderButton } from "@/components/HeaderButton"
import ItemFormModal from "@/components/ItemFormModal"
import { safeAccess } from "@/helpers"
import { formatFieldValue } from "@/helpers/field"
import { useCollection } from "@/hooks/useCollection"

export default function ItemDetailScreen() {
  const { cId, iId } = useLocalSearchParams()

  const collectionId = cId as unknown as CollectionId
  const itemId = iId as unknown as ItemId

  const router = useRouter()
  const navigation = useNavigation()

  const [itemModalVisible, setItemModalVisible] = useState(false)

  const {
    getItem,
    getItemIndex,
    itemOrder,
    name,
    fields,
    fieldOrder,
    updateItem,
  } = useCollection(collectionId)

  const itemIndex = getItemIndex(itemId)
  const item = getItem(itemId)

  const goToItem = (newIndex: number) => {
    router.replace(`/${collectionId}/items/${safeAccess(itemOrder, newIndex)}`)
  }

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
        <ScrollView contentContainerStyle={styles.container}>
          {fieldOrder.map(fieldId => {
            const value = item[fieldId]
            if (value === undefined) {
              return null
            }
            const field = fields[fieldId]
            const label = field.name
            const displayValue = formatFieldValue({
              ...field,
              value,
            } as FieldAndValue)

            return (
              <View key={fieldId} style={styles.fieldRow}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.value}>{displayValue}</Text>
                </View>
              </View>
            )
          })}
        </ScrollView>
      </PanGestureHandler>

      <ItemFormModal
        mode="edit"
        visible={itemModalVisible}
        fieldOrder={fieldOrder}
        fields={fields}
        initialValues={item}
        onSubmit={updatedItem => {
          updateItem(itemId, updatedItem)
          setItemModalVisible(false)
        }}
        onDiscard={() => setItemModalVisible(false)}
      />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    gap: 8,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    maxWidth: "40%",
    flexShrink: 1,
  },
  valueContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  value: {
    fontSize: 16,
    color: "#555",
    textAlign: "right",
  },
})
