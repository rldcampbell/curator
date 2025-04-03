import React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

type SwipeButton<T> = {
  icon: React.ReactNode
  onPress: (item: T) => void
}

type Props<T> = {
  item: T
  renderContent: (item: T) => React.ReactNode
  buttons: SwipeButton<T>[]
}

export const ROW_HEIGHT = 60

export default function SwipeableDraggableRow<T>({
  item,
  renderContent,
  buttons,
}: Props<T>) {
  const translateX = useSharedValue(0)
  const buttonWidth = 64
  const totalButtonWidth = buttonWidth * buttons.length

  const panGesture = Gesture.Pan()
    .onChange(event => {
      const newX = translateX.value + event.changeX
      translateX.value = Math.max(Math.min(newX, 0), -totalButtonWidth)
    })
    .onEnd(() => {
      const snapPoint =
        Math.abs(translateX.value) > totalButtonWidth / 2
          ? -totalButtonWidth
          : 0
      translateX.value = withSpring(snapPoint, { damping: 20, stiffness: 200 })
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <View style={styles.rowContainer}>
      {/* Buttons behind swiped row */}
      <View style={[styles.buttonRow, { width: totalButtonWidth }]}>
        {buttons.map((btn, index) => (
          <Pressable
            key={index}
            style={[styles.iconButton, { width: buttonWidth }]}
            onPress={() => btn.onPress(item)}
          >
            {btn.icon}
          </Pressable>
        ))}
      </View>

      {/* Foreground swipable row */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.swipeable, animatedStyle]}>
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
    flexDirection: "row",
    backgroundColor: "#eee",
    alignItems: "center",
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    height: ROW_HEIGHT,
  },
})
