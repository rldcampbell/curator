import React from "react"
import { Dimensions, Pressable, StyleSheet, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

type SwipeButton<T> = {
  icon: React.ReactNode
  onPress: (item: T) => void
  backgroundColor?: string
}

type Props<T> = {
  item: T
  renderContent: (item: T) => React.ReactNode
  buttons: SwipeButton<T>[]
}

const SCREEN_WIDTH = Dimensions.get("window").width
export const ROW_HEIGHT = 60

export default function SwaggableRow<T>({
  item,
  renderContent,
  buttons,
}: Props<T>) {
  const translateX = useSharedValue(0)
  const idealButtonWidth = 60
  const idealTotalWidth = buttons.length * idealButtonWidth

  const panGesture = Gesture.Pan()
    .onChange(event => {
      const newX = translateX.value + event.changeX
      translateX.value = Math.max(Math.min(newX, 0), -SCREEN_WIDTH)
    })
    .onEnd(() => {
      const snapPoint =
        Math.abs(translateX.value) > idealTotalWidth / 2 ? -idealTotalWidth : 0

      translateX.value = withSpring(snapPoint, {
        damping: 20,
        stiffness: 200,
      })
    })

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const buttonStripStyle = useAnimatedStyle(() => {
    const totalDrag = Math.abs(translateX.value)
    return {
      width: totalDrag,
      flexDirection: "row",
    }
  })

  return (
    <View style={styles.rowContainer}>
      {/* Buttons revealed behind swiped row */}
      <Animated.View style={[styles.buttonRow, buttonStripStyle]}>
        {buttons.map((btn, index) => (
          <Animated.View
            key={index}
            style={[
              styles.iconButton,
              {
                flex: 1,
                backgroundColor: btn.backgroundColor ?? "#ccc",
              },
            ]}
          >
            <Pressable
              onPress={() => runOnJS(btn.onPress)(item)}
              style={styles.pressable}
            >
              {btn.icon}
            </Pressable>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Foreground swipable row */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.swipeable, rowStyle]}>
          {renderContent(item)}
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  rowContainer: {
    height: ROW_HEIGHT,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  swipeable: {
    position: "absolute",
    width: "100%",
    height: ROW_HEIGHT,
    backgroundColor: "white",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonRow: {
    position: "absolute",
    right: 0,
    height: ROW_HEIGHT,
    backgroundColor: "#eee",
    alignItems: "center",
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    height: ROW_HEIGHT,
  },
  pressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
