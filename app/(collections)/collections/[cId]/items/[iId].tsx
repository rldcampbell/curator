import { useLayoutEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import {
  GestureEvent,
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler"

import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"

import {
  CollectionId,
  FieldType,
  ItemId,
  RawFieldAndValue,
  WithMeta,
} from "@/app/types"
import AppText from "@/components/AppText"
import { HeaderButton } from "@/components/HeaderButton"
import ImagePreview from "@/components/ImagePreview"
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
    router.replace({
      pathname: "/collections/[cId]/items/[iId]",
      params: {
        cId: collectionId,
        iId: safeAccess(itemOrder, newIndex),
      },
    })
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
            const field = fields[fieldId]
            if (value === undefined) return null

            const fieldWithValue = {
              ...field,
              value,
            } as WithMeta<RawFieldAndValue>
            const label = fieldWithValue.name

            if (fieldWithValue.type === FieldType.Image) {
              if (!fieldWithValue.value || fieldWithValue.value.length === 0) {
                return null // don't display this field at all
              }

              return (
                <View key={fieldId} style={{ gap: 8 }}>
                  <AppText weight="bold" style={styles.label}>
                    {label}
                  </AppText>
                  <ImagePreview uri={fieldWithValue.value[0]} />
                </View>
              )
            }

            const displayValue = formatFieldValue(fieldWithValue)

            return (
              <View key={fieldId} style={styles.fieldRow}>
                <AppText weight="bold" style={styles.label}>
                  {label}
                </AppText>
                <View style={styles.valueContainer}>
                  <AppText style={styles.value}>{displayValue}</AppText>
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
