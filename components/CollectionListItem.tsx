import { StyleSheet } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"

import { Collection, CollectionId } from "@/app/types"
import { getCollectionColorScheme } from "@/helpers/color"

import AppText from "./AppText"

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
      <AppText weight="medium" style={styles.title}>
        {collection.name}
      </AppText>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  colorPill: {
    width: 6,
    borderRadius: 3,
    alignSelf: "stretch",
    marginRight: 12,
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
  },
})

export default CollectionListItem
