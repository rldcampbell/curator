import { requireNativeViewManager } from "expo-modules-core"
import React, { useCallback } from "react"
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from "react-native"

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

const PICKER_HEIGHT = 216
const LABEL_ROW_HEIGHT = 28

export default function TemporalWheelPicker({
  columns,
  selectedIndexes,
  onSelectionChange,
  style,
  ...containerProps
}: TemporalWheelPickerProps) {
  const handleSelectionChange = useCallback(
    (event: NativeSyntheticEvent<TemporalWheelPickerChange>) => {
      onSelectionChange?.(event.nativeEvent)
    },
    [onSelectionChange],
  )
  const hasVisibleLabels = columns.some(column => column.label.trim().length > 0)

  if (!NativeTemporalWheelPicker) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>
          TemporalWheelPicker requires an iOS development build.
        </Text>
      </View>
    )
  }

  const nativePickerProps: NativeTemporalWheelPickerProps = {
    columns,
    selectedIndexes,
    style: styles.nativePicker,
  }

  if (onSelectionChange) {
    nativePickerProps.onSelectionChange = handleSelectionChange
  }

  return (
    <View
      {...(containerProps as ViewProps)}
      style={[
        styles.shell,
        hasVisibleLabels && styles.shellWithLabels,
        style,
      ]}
    >
      <View style={styles.pickerFrame}>
        <NativeTemporalWheelPicker {...nativePickerProps} />
      </View>
      {hasVisibleLabels ? (
        <View style={styles.labelRow}>
          {columns.map(column => (
            <View key={column.key} style={styles.labelCell}>
              <Text style={styles.labelText}>{column.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    minHeight: PICKER_HEIGHT,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d8dee9",
    backgroundColor: "#fbfcfe",
    overflow: "hidden",
  },
  shellWithLabels: {
    minHeight: PICKER_HEIGHT + LABEL_ROW_HEIGHT,
  },
  pickerFrame: {
    height: PICKER_HEIGHT,
    justifyContent: "center",
    backgroundColor: "#fbfcfe",
  },
  nativePicker: {
    height: PICKER_HEIGHT,
    width: "100%",
  },
  labelRow: {
    height: LABEL_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e9f0",
    backgroundColor: "#f5f7fb",
  },
  labelCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    color: "#5d6b82",
    textTransform: "lowercase",
  },
  fallback: {
    minHeight: PICKER_HEIGHT,
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
