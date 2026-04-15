import { Pressable, StyleSheet, View } from "react-native"

import { modalStyles, stateStyles, surfaceStyles } from "@/styles"

import AppText from "./AppText"

type ModalButtonRowProps = {
  onApply: () => void
  onDiscard: () => void
  onClear?: (() => void) | undefined
  applyLabel?: string
  discardLabel?: string
  clearLabel?: string
  applyDisabled?: boolean
}

export default function ModalButtonRow({
  onApply,
  onDiscard,
  onClear,
  applyLabel = "Apply",
  discardLabel = "Discard",
  clearLabel = "Clear",
  applyDisabled,
}: ModalButtonRowProps) {
  return (
    <View style={styles.row}>
      {onClear && (
        <Pressable
          style={[
            surfaceStyles.card,
            modalStyles.clearButton,
            modalStyles.buttonInModal,
            styles.button,
          ]}
          onPress={onClear}
        >
          <AppText>{clearLabel}</AppText>
        </Pressable>
      )}

      <Pressable
        style={[
          surfaceStyles.card,
          modalStyles.addButton,
          modalStyles.buttonInModal,
          applyDisabled ? stateStyles.disabled : undefined,
          styles.button,
        ]}
        onPress={() => {
          !applyDisabled && onApply()
        }}
      >
        <AppText>{applyLabel}</AppText>
      </Pressable>

      <Pressable
        style={[
          surfaceStyles.card,
          modalStyles.closeButton,
          modalStyles.buttonInModal,
          styles.button,
        ]}
        onPress={onDiscard}
      >
        <AppText>{discardLabel}</AppText>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
  },
})
