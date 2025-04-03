import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import { Ionicons } from "@expo/vector-icons"

type HeaderButtonProps = {
  iconName?: keyof typeof Ionicons.glyphMap
  label?: string
  onPress: () => void
}

export const HeaderButton: React.FC<HeaderButtonProps> = ({
  iconName,
  label,
  onPress,
}) => {
  const resolvedLabel = iconName ? label : (label ?? "Button")

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} hitSlop={8}>
      <View style={styles.inner}>
        {iconName && <Ionicons name={iconName} size={26} color="#007AFF" />}
        {resolvedLabel && <Text style={styles.text}>{resolvedLabel}</Text>}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // modern flex gap
  },
  text: {
    fontSize: 16,
    color: "#007AFF",
  },
})
