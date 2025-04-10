import React, { useState } from "react"
import { Animated, SafeAreaView, StyleSheet } from "react-native"
import DraggableFlatList, { RenderItem } from "react-native-draggable-flatlist"

import * as Haptics from "expo-haptics"

import { Feather } from "@expo/vector-icons"

import AppText from "@/components/AppText"
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

  const renderItem: RenderItem<string> = ({ item, drag, isActive }) => (
    <SwaggableRow
      item={item}
      onDrag={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        drag()
      }}
      buttons={buttons}
      renderContent={item => (
        <Animated.View
          style={{
            backgroundColor: isActive ? "#d0ebff" : "#fff",
            padding: 16,
          }}
        >
          <AppText>{item}</AppText>
        </Animated.View>
      )}
    />
  )

  return (
    <SafeAreaView style={styles.container}>
      <AppText weight="semiBold" style={styles.title}>
        🧪 Swipe to Reveal Actions
      </AppText>
      <DraggableFlatList
        data={items}
        onDragEnd={({ data }) => setItems(data)}
        keyExtractor={item => item}
        renderItem={renderItem}
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
    padding: 16,
  },
})
