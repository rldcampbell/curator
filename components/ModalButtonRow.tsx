import { Pressable, View } from "react-native"

import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import AppText from "./AppText"

type ModalButtonRowProps = {
  onApply: () => void
  onDiscard: () => void
  applyLabel?: string
  discardLabel?: string
  applyDisabled?: boolean
}

export default function ModalButtonRow({
  onApply,
  onDiscard,
  applyLabel = "Apply",
  discardLabel = "Discard",
  applyDisabled,
}: ModalButtonRowProps) {
  return (
    <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
      <Pressable
        style={[
          sharedStyles.card,
          modalStyles.addButton,
          modalStyles.buttonInModal,
          applyDisabled ? sharedStyles.disabled : {},
          { flex: 1 },
        ]}
        onPress={() => {
          !applyDisabled && onApply()
        }}
      >
        <AppText>{applyLabel}</AppText>
      </Pressable>

      <Pressable
        style={[
          sharedStyles.card,
          modalStyles.closeButton,
          modalStyles.buttonInModal,
          { flex: 1 },
        ]}
        onPress={onDiscard}
      >
        <AppText>{discardLabel}</AppText>
      </Pressable>
    </View>
  )
}
