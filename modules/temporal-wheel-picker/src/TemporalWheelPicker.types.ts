import { NativeSyntheticEvent, ViewProps } from "react-native"

export type TemporalWheelPickerColumn = {
  key: string
  label: string
  options: string[]
  accessibilityLabel?: string
}

export type TemporalWheelPickerChange = {
  selectedIndexes: number[]
  changedColumn: number
}

export type NativeTemporalWheelPickerProps = ViewProps & {
  columns: TemporalWheelPickerColumn[]
  selectedIndexes: number[]
  onSelectionChange?: (
    event: NativeSyntheticEvent<TemporalWheelPickerChange>,
  ) => void
}

export type TemporalWheelPickerProps = ViewProps & {
  columns: TemporalWheelPickerColumn[]
  selectedIndexes: number[]
  onSelectionChange?: (change: TemporalWheelPickerChange) => void
}
