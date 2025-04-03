import React, { useState } from "react"
import { Animated, SafeAreaView, StyleSheet, Text } from "react-native"
import DraggableFlatList from "react-native-draggable-flatlist"

import * as Haptics from "expo-haptics"

import { Feather } from "@expo/vector-icons"

import SwaggableRow from "@/components/SwaggableRow"

export default function TestScreen() {
  const [items, setItems] = useState(
    Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`),
  )

  const buttons = [
    {
      icon: <Feather name="trash-2" size={20} color="black" />,
      onPress: (item: string) => console.log("Delete:", item),
      backgroundColor: "#e74c3c", // red
    },
    {
      icon: <Feather name="edit-3" size={20} color="black" />,
      onPress: (item: string) => console.log("Edit:", item),
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🧪 Swipe to Reveal Actions</Text>
      <DraggableFlatList
        data={items}
        onDragEnd={({ data }) => setItems(data)}
        keyExtractor={item => item}
        renderItem={({ item, drag, isActive }) => (
          <SwaggableRow
            item={item}
            isActive={isActive}
            onDrag={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              drag()
            }}
            buttons={buttons}
            renderContent={(item, isActive) => (
              <Animated.View
                style={{
                  backgroundColor: isActive ? "#d0ebff" : "#fff",
                  padding: 16,
                }}
              >
                <Text>{item}</Text>
              </Animated.View>
            )}
          />
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    padding: 16,
  },
})
