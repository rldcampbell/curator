import React, { useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"

import CompactModalLayout from "./CompactModalLayout"
import ModalButtonRow from "./ModalButtonRow"
import MultiWheelPicker from "./MultiWheelPicker"
import TemporalWheelPicker, {
  isTemporalWheelPickerAvailable,
  TemporalWheelPickerColumn,
} from "./TemporalWheelPicker"

export type NumericWheelPickerConfig = {
  min: number
  max: number
  label: string
  showUndefined?: boolean
}

type MultiWheelPickerModalProps = {
  visible: boolean
  title?: string
  initialValue: (number | undefined)[]
  pickerConfigs: NumericWheelPickerConfig[]
  onSubmit: (newValue: (number | undefined)[]) => void
  onCancel: () => void
  onClear?: () => void
}

export default function MultiWheelPickerModal({
  visible,
  title,
  initialValue,
  pickerConfigs,
  onSubmit,
  onCancel,
  onClear,
}: MultiWheelPickerModalProps) {
  const [localValue, setLocalValue] =
    useState<(number | undefined)[]>(initialValue)
  const columnValues = useMemo(
    () =>
      pickerConfigs.map(({ min, max, showUndefined = false }) => [
        ...(showUndefined ? [undefined] : []),
        ...Array.from({ length: max - min + 1 }, (_, index) => min + index),
      ]),
    [pickerConfigs],
  )
  const pickerColumns = useMemo<TemporalWheelPickerColumn[]>(
    () =>
      pickerConfigs.map((config, columnIndex) => ({
        key: `${config.label}-${columnIndex}`,
        label: config.label,
        options: columnValues[columnIndex].map(value =>
          value === undefined ? "-" : value.toString(),
        ),
      })),
    [columnValues, pickerConfigs],
  )
  const selectedIndexes = useMemo(
    () =>
      columnValues.map((values, columnIndex) => {
        const selectedValue = localValue[columnIndex]
        const selectedIndex = values.findIndex(value => value === selectedValue)
        return selectedIndex >= 0 ? selectedIndex : 0
      }),
    [columnValues, localValue],
  )

  useEffect(() => {
    if (visible) {
      setLocalValue(initialValue)
    }
  }, [visible, initialValue])

  return (
    <CompactModalLayout
      visible={visible}
      onRequestClose={onCancel}
      title={title}
      footer={
        <ModalButtonRow
          onApply={() => onSubmit(localValue)}
          onDiscard={onCancel}
          onClear={onClear}
        />
      }
    >
      {isTemporalWheelPickerAvailable ? (
        <TemporalWheelPicker
          columns={pickerColumns}
          selectedIndexes={selectedIndexes}
          onSelectionChange={({ selectedIndexes: nextIndexes }) => {
            setLocalValue(
              nextIndexes.map(
                (selectedIndex, columnIndex) =>
                  columnValues[columnIndex]?.[selectedIndex] ?? undefined,
              ),
            )
          }}
          style={styles.nativePicker}
        />
      ) : (
        <MultiWheelPicker
          pickers={pickerConfigs}
          value={localValue}
          onChange={setLocalValue}
        />
      )}
    </CompactModalLayout>
  )
}

const styles = StyleSheet.create({
  nativePicker: {
    width: "100%",
    alignSelf: "stretch",
  },
})
