import { useLayoutEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import {
  GestureEvent,
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler"

import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"

import { CollectionId, ItemId, RawFieldAndValue, WithMeta } from "@/app/types"
import AppText from "@/components/AppText"
import { HeaderButton } from "@/components/HeaderButton"
import ItemFormModal from "@/components/ItemFormModal"
import { safeAccess } from "@/helpers"
import { useCollection } from "@/hooks/useCollection"
import { fieldService } from "@/services/fieldService"

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
            const value = item.values[fieldId]
            if (value === undefined) return null
            const field = fields[fieldId]

            const fieldWithValue = {
              ...field,
              value,
            } as WithMeta<RawFieldAndValue>
            const label = fieldWithValue.name

            return (
              <View key={fieldId} style={styles.fieldRow}>
                <AppText weight="bold" style={styles.label}>
                  {label}
                </AppText>
                {fieldService.display(fieldWithValue)}
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
        initialValues={item.values}
        onSubmit={values => {
          updateItem(itemId, { values })
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
