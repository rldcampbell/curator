// DatePartsPicker.tsx
import React from "react"
import { StyleSheet, View } from "react-native"
import DropDownPicker from "react-native-dropdown-picker"

import AppText from "@/components/AppText"
import {
  TEMPORAL_UNIT_LABELS,
  getTemporalUnitIndex,
} from "@/helpers/temporal"
import { formStyles, spacing } from "@/styles"
import { TEMPORAL_UNITS, TemporalFieldConfig, TemporalUnit } from "@/types"

export interface DatePartsPickerProps {
  config: TemporalFieldConfig
  onConfigChange: (config: TemporalFieldConfig) => void
}

export default function DatePartsPicker({
  config,
  onConfigChange,
}: DatePartsPickerProps) {
  const [topUnit, setTopUnit] = React.useState<TemporalUnit>(config.topUnit)
  const [bottomUnit, setBottomUnit] = React.useState<TemporalUnit>(
    config.bottomUnit,
  )

  const [maxOpen, setMaxOpen] = React.useState(false)
  const [minOpen, setMinOpen] = React.useState(false)

  React.useEffect(() => {
    setTopUnit(config.topUnit)
    setBottomUnit(config.bottomUnit)
  }, [config.bottomUnit, config.topUnit])

  const updateConfig = (nextTopUnit: TemporalUnit, nextBottomUnit: TemporalUnit) => {
    setTopUnit(nextTopUnit)
    setBottomUnit(nextBottomUnit)
    onConfigChange({
      topUnit: nextTopUnit,
      bottomUnit: nextBottomUnit,
    })
  }

  const handleTopUnitChange = (
    value: (prevState: TemporalUnit) => TemporalUnit,
  ) => {
    const nextTopUnit = value(topUnit)
    const adjustedBottomUnit =
      getTemporalUnitIndex(nextTopUnit) > getTemporalUnitIndex(bottomUnit)
        ? nextTopUnit
        : bottomUnit

    updateConfig(nextTopUnit, adjustedBottomUnit)
  }

  const handleBottomUnitChange = (
    value: (prevState: TemporalUnit) => TemporalUnit,
  ) => {
    const nextBottomUnit = value(bottomUnit)
    const adjustedTopUnit =
      getTemporalUnitIndex(nextBottomUnit) < getTemporalUnitIndex(topUnit)
        ? nextBottomUnit
        : topUnit

    updateConfig(adjustedTopUnit, nextBottomUnit)
  }

  const dropdownItems = TEMPORAL_UNITS.map(unit => ({
    label: TEMPORAL_UNIT_LABELS[unit],
    value: unit,
  }))

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.pickerColumn}>
          <AppText style={formStyles.label}>Largest Unit</AppText>
          <DropDownPicker
            open={maxOpen}
            setOpen={setMaxOpen}
            value={topUnit}
            setValue={handleTopUnitChange}
            items={dropdownItems}
            onOpen={() => setMinOpen(false)}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>
        <View style={styles.pickerColumn}>
          <AppText style={formStyles.label}>Smallest Unit</AppText>
          <DropDownPicker
            open={minOpen}
            setOpen={setMinOpen}
            value={bottomUnit}
            setValue={handleBottomUnitChange}
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

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  pickerColumn: {
    flex: 1,
  },
})
