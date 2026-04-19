import React from "react"
import { StyleSheet, Text, View } from "react-native"

import { TemporalWheelPickerProps } from "./TemporalWheelPicker.types"

export const isTemporalWheelPickerAvailable = false

export default function TemporalWheelPicker({
  style,
}: TemporalWheelPickerProps) {
  return (
    <View style={[styles.fallback, style]}>
      <Text style={styles.fallbackText}>
        TemporalWheelPicker is currently implemented for iOS only.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  fallback: {
    minHeight: 216,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d0d0d0",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
  },
  fallbackText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
})
