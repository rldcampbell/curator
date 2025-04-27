// DatePartsPicker.tsx
import React from "react"
import { View } from "react-native"
import DropDownPicker from "react-native-dropdown-picker"

import AppText from "@/components/AppText"
import { sharedStyles } from "@/styles/sharedStyles"

const LABELS = [
  "Year",
  "Month",
  "Day",
  "Hour",
  "Minute",
  "Second",
  "Millisecond",
] as const

const KEYS = [0, 1, 2, 3, 4, 5, 6] as const

type PartIndex = (typeof KEYS)[number]

export interface DatePartsPickerProps {
  parts: boolean[]
  onPartsChange: (parts: boolean[]) => void
}

export default function DatePartsPicker({
  parts,
  onPartsChange,
}: DatePartsPickerProps) {
  const initialMax = parts.findIndex(p => p)
  const initialMin = (() => {
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i]) return i
    }
    return 0
  })()

  const [maxPart, setMaxPart] = React.useState<PartIndex>(
    initialMax as PartIndex,
  )
  const [minPart, setMinPart] = React.useState<PartIndex>(
    initialMin as PartIndex,
  )

  const [maxOpen, setMaxOpen] = React.useState(false)
  const [minOpen, setMinOpen] = React.useState(false)

  const updateParts = (newMax: PartIndex, newMin: PartIndex) => {
    const updated = KEYS.map(index => index >= newMax && index <= newMin)
    onPartsChange(updated)
  }

  const handleMaxChange = (value: (prevState: PartIndex) => PartIndex) => {
    const newMax = value(maxPart)
    const adjustedMax = Math.min(newMax, minPart) as PartIndex
    setMaxPart(adjustedMax)
    updateParts(adjustedMax, minPart)
  }

  const handleMinChange = (value: (prevState: PartIndex) => PartIndex) => {
    const newMin = value(minPart)
    const adjustedMin = Math.max(newMin, maxPart) as PartIndex
    setMinPart(adjustedMin)
    updateParts(maxPart, adjustedMin)
  }

  const dropdownItems = KEYS.map((key, i) => ({ label: LABELS[i], value: key }))

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <View style={{ flex: 1 }}>
          <AppText style={sharedStyles.label}>Largest Unit</AppText>
          <DropDownPicker
            open={maxOpen}
            setOpen={setMaxOpen}
            value={maxPart}
            setValue={handleMaxChange}
            items={dropdownItems}
            onOpen={() => setMinOpen(false)}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={sharedStyles.label}>Smallest Unit</AppText>
          <DropDownPicker
            open={minOpen}
            setOpen={setMinOpen}
            value={minPart}
            setValue={handleMinChange}
            items={dropdownItems}
            onOpen={() => setMaxOpen(false)}
            zIndex={2000}
            zIndexInverse={2000}
          />
        </View>
      </View>
    </View>
  )
}
