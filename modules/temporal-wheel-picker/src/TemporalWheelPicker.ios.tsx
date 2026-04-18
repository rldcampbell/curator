import { requireNativeViewManager } from "expo-modules-core"
import React, { useCallback } from "react"
import { NativeSyntheticEvent, StyleSheet, Text, View } from "react-native"

import {
  NativeTemporalWheelPickerProps,
  TemporalWheelPickerChange,
  TemporalWheelPickerProps,
} from "./TemporalWheelPicker.types"

let NativeTemporalWheelPicker: React.ComponentType<NativeTemporalWheelPickerProps> | null =
  null

try {
  NativeTemporalWheelPicker =
    requireNativeViewManager<NativeTemporalWheelPickerProps>(
      "CuratorTemporalWheelPicker",
    )
} catch {
  NativeTemporalWheelPicker = null
}

export const isTemporalWheelPickerAvailable =
  NativeTemporalWheelPicker !== null

export default function TemporalWheelPicker({
  onSelectionChange,
  ...props
}: TemporalWheelPickerProps) {
  const handleSelectionChange = useCallback(
    (event: NativeSyntheticEvent<TemporalWheelPickerChange>) => {
      onSelectionChange?.(event.nativeEvent)
    },
    [onSelectionChange],
  )

  if (!NativeTemporalWheelPicker) {
    return (
      <View style={[styles.fallback, props.style]}>
        <Text style={styles.fallbackText}>
          TemporalWheelPicker requires an iOS development build.
        </Text>
      </View>
    )
  }

  if (onSelectionChange) {
    return (
      <NativeTemporalWheelPicker
        {...props}
        onSelectionChange={handleSelectionChange}
      />
    )
  }

  return <NativeTemporalWheelPicker {...props} />
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
