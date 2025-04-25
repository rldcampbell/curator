import React from "react"
import { StyleSheet, View } from "react-native"

import WheelPicker, { WheelPickerProps } from "./WheelPicker"

export type MultiWheelPickerProps = {
  pickers: Omit<WheelPickerProps, "value" | "onChange">[]
  value: (number | undefined)[]
  onChange: (newValue: (number | undefined)[]) => void
  gap?: number
}

const MultiWheelPicker = ({
  pickers,
  value,
  onChange,
  gap = 8,
}: MultiWheelPickerProps) => {
  const handleChange = (index: number, newVal: number | undefined) => {
    const updated = [...value]
    updated[index] = newVal
    onChange(updated)
  }

  return (
    <View style={[styles.container, { columnGap: gap }]}>
      {pickers.map((pickerConfig, index) => (
        <WheelPicker
          key={index}
          {...pickerConfig}
          value={value[index]}
          onChange={newVal => handleChange(index, newVal)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
  },
})

export default MultiWheelPicker
