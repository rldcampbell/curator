// components/ModalButtonRow.tsx
import { Pressable, Text, View } from "react-native"

import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

type ModalButtonRowProps = {
  onCreate: () => void
  onDiscard: () => void
  createLabel?: string
  discardLabel?: string
}

export default function ModalButtonRow({
  onCreate,
  onDiscard,
  createLabel = "Create",
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
        onPress={onCreate}
      >
        <Text>{createLabel}</Text>
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
