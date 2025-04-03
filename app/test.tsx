import React, { useState } from "react"
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native"

import { Feather } from "@expo/vector-icons"

import SwipeableDraggableRow, {
  ROW_HEIGHT,
} from "../components/SwipeableDraggableRow"

export default function TestScreen() {
  const [items] = useState(
    Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`),
  )

  const buttons = [
    {
      icon: <Feather name="trash-2" size={20} color="black" />,
      onPress: (item: string) => console.log("Delete:", item),
    },
    {
      icon: <Feather name="edit-3" size={20} color="black" />,
      onPress: (item: string) => console.log("Edit:", item),
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🧪 Swipe to Reveal Actions</Text>
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <SwipeableDraggableRow
            item={item}
            renderContent={text => <Text style={styles.text}>{text}</Text>}
            buttons={buttons}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: "#ddd" }} />
        )}
        getItemLayout={(_, index) => ({
          length: ROW_HEIGHT + 1,
          offset: index * (ROW_HEIGHT + 1),
          index,
        })}
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
  text: {
    fontSize: 16,
  },
})
