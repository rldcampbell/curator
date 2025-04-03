import React from "react"
import { Dimensions, Pressable, StyleSheet, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

import * as Haptics from "expo-haptics"

type SwipeButton<T> = {
  icon: React.ReactNode
  onPress: (item: T) => void
  backgroundColor?: string
}

type Props<T> = {
  item: T
  renderContent: (item: T, isActive: boolean) => React.ReactElement
  buttons: SwipeButton<T>[]

  // 🔁 Drag support
  onDrag: () => void
  onDragStart?: () => void
  onDragEnd?: () => void

  isActive?: boolean
  enableHaptics?: boolean
}

const SCREEN_WIDTH = Dimensions.get("window").width

export default function SwaggableRow<T>({
  item,
  renderContent,
  buttons,
  onDrag,
  onDragStart,
  onDragEnd,
  isActive = false,
  enableHaptics = true,
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

  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      if (enableHaptics) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
      }
      if (onDragStart) runOnJS(onDragStart)()
      runOnJS(onDrag)()
    })
    .onEnd(() => {
      if (onDragEnd) runOnJS(onDragEnd)()
    })

  const combinedGesture = Gesture.Simultaneous(panGesture, longPressGesture)

  const swipeStyle = useAnimatedStyle(() => ({
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
    <View style={styles.container}>
      {/* Swipe-revealed buttons behind */}
      <Animated.View style={[styles.buttonRow, buttonStripStyle]}>
        {buttons.map((btn, index) => (
          <Animated.View
            key={index}
            style={[
              {
                flex: 1,
                backgroundColor: btn.backgroundColor ?? "#ccc",
                justifyContent: "center",
                alignItems: "center",
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

      {/* Foreground draggable/swipeable layer */}
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={swipeStyle}>
          {renderContent(item, isActive)}
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  buttonRow: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#eee",
    alignItems: "center",
  },
  pressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
