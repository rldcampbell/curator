import { useLayoutEffect, useState } from "react"
import { Animated } from "react-native"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"

import { router, useNavigation } from "expo-router"

import { Feather } from "@expo/vector-icons"

import { CollectionId } from "@/app/types"
import AppText from "@/components/AppText"
import ConfirmModal from "@/components/ConfirmModal"
import FullPageLayout from "@/components/FullPageLayout"
import { HeaderButton } from "@/components/HeaderButton"
import SwaggableRow from "@/components/SwaggableRow"
import { useCollections } from "@/context/CollectionsContext"

export default function CollectionsScreen() {
  const {
    collections,
    collectionOrder,
    updateCollectionOrder,
    deleteCollection,
  } = useCollections()

  const [pendingDeleteId, setPendingDeleteId] = useState<CollectionId | null>(
    null,
  )

  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Collections",
      headerRight: () => (
        <HeaderButton
          iconName="add"
          onPress={() => router.push("/add-collection")}
        />
      ),
    })
  }, [navigation])

  return (
    <FullPageLayout>
      <DraggableFlatList
        data={collectionOrder}
        keyExtractor={item => item}
        onDragEnd={({ data }) => updateCollectionOrder(data)}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({
          item,
          drag,
          isActive,
        }: RenderItemParams<CollectionId>) => {
          const collection = collections[item]

          const buttons = [
            {
              icon: <Feather name="edit-3" size={20} color="black" />,
              onPress: () => {
                // Edit action (not implemented yet)
              },
            },
            {
              icon: <Feather name="trash-2" size={20} color="black" />,
              onPress: () => setPendingDeleteId(item),
              backgroundColor: "#e74c3c",
            },
          ]

          return (
            <SwaggableRow
              item={item}
              onDrag={drag}
              onPress={() => router.push(`/(collections)/${item}`)}
              buttons={buttons}
              renderContent={() => (
                <Animated.View
                  style={{
                    backgroundColor: isActive ? "#f0f0f0" : "#fff",
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                  }}
                >
                  <AppText weight="semiBold" style={{ fontSize: 18 }}>
                    {collection.name}
                  </AppText>
                </Animated.View>
              )}
            />
          )
        }}
      />

      <ConfirmModal
        visible={!!pendingDeleteId}
        title="Delete collection?"
        message={`Are you sure you want to permanently delete '${collections[pendingDeleteId!]?.name}' and all its items?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (pendingDeleteId) {
            deleteCollection(pendingDeleteId)
            setPendingDeleteId(null)
          }
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </FullPageLayout>
  )
}
