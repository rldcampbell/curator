// components/ModalButtonRow.tsx
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
    <View style={{ width: "100%" }}>
      <Pressable
        style={[
          sharedStyles.card,
          modalStyles.addButton,
          modalStyles.buttonInModal,
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
        ]}
        onPress={onDiscard}
      >
        <Text>{discardLabel}</Text>
      </Pressable>
    </View>
  )
}
