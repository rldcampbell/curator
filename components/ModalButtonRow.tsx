import { Pressable, Text, View } from "react-native"

import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

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
        <Text>{applyLabel}</Text>
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
        <Text>{discardLabel}</Text>
      </Pressable>
    </View>
  )
}
