import { Pressable, Text, View } from "react-native"

import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

type ModalButtonRowProps = {
  onApply: () => void
  onDiscard: () => void
  applyLabel?: string
  discardLabel?: string
}

export default function ModalButtonRow({
  onApply,
  onDiscard,
  applyLabel = "Apply",
  discardLabel = "Discard",
}: ModalButtonRowProps) {
  return (
    <View
      style={{ flexDirection: "row", gap: 12, width: "100%", marginTop: 8 }}
    >
      <Pressable
        style={[
          sharedStyles.card,
          modalStyles.addButton,
          modalStyles.buttonInModal,
          { flex: 1 },
        ]}
        onPress={onApply}
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
