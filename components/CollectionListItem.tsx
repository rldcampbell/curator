import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"

import { Collection, CollectionId } from "@/types"
import { getCollectionColorScheme } from "@/helpers/color"

import AppText from "./AppText"
import CountBadge from "./CountBadge"

type Props = {
  collection: Collection
  collectionId: CollectionId
  isActive: boolean
}

const CollectionListItem = ({ collection, collectionId, isActive }: Props) => {
  const { accent, background } = getCollectionColorScheme(
    collectionId,
    collection,
  )
  const itemCount = collection.itemOrder.length

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 0.8 : 1, { duration: 150 }),
      transform: [
        {
          scale: withTiming(isActive ? 0.97 : 1, { duration: 150 }),
        },
      ],
    }
  }, [isActive])

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: background }, animatedStyle]}
    >
      <Animated.View style={[styles.colorPill, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <AppText weight="medium" style={styles.title}>
          {collection.name}
        </AppText>
      </View>
      <CountBadge count={itemCount} singularLabel="item" accentColor={accent} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  colorPill: {
    width: 6,
    borderRadius: 3,
    alignSelf: "stretch",
    marginRight: 12,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
  },
})

export default CollectionListItem
