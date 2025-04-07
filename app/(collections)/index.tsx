import { useLayoutEffect } from "react"
import { TouchableOpacity } from "react-native"
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist"

import { router, useNavigation } from "expo-router"

import { CollectionId } from "@/app/types"
import AppText from "@/components/AppText"
import FullPageLayout from "@/components/FullPageLayout"
import { HeaderButton } from "@/components/HeaderButton"
import { useCollections } from "@/context/CollectionsContext"
import { sharedStyles } from "@/styles/sharedStyles"

export default function CollectionsScreen() {
  const { collections, collectionOrder, updateCollectionOrder } =
    useCollections()

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
        contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
        renderItem={({
          item,
          drag,
          isActive,
        }: RenderItemParams<CollectionId>) => {
          const collection = collections[item]
          return (
            <TouchableOpacity
              key={item}
              style={[
                sharedStyles.card,
                isActive ? sharedStyles.activeCard : null,
              ]}
              onLongPress={drag}
              delayLongPress={300}
              onPress={() => router.push(`/(collections)/${item}`)}
            >
              <AppText weight="medium" style={sharedStyles.cardText}>
                {collection.name}
              </AppText>
            </TouchableOpacity>
          )
        }}
      />
    </FullPageLayout>
  )
}
