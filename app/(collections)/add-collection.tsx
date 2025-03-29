import { sharedStyles } from "@/styles/shared"
import { useState } from "react"
import {
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"

export default function AddCollectionScreen() {
  const [collectionName, setCollectionName] = useState("")

  return (
    <KeyboardAvoidingView
      style={sharedStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={sharedStyles.scrollContainer}>
        {/* Input for collection name */}
        <TextInput
          style={sharedStyles.inputCard}
          placeholder="New Collection"
          placeholderTextColor="#999"
          value={collectionName}
          onChangeText={setCollectionName}
          maxLength={30}
        />

        {/* Add field button */}
        <Pressable
          style={[sharedStyles.card, sharedStyles.addCard]}
          onPress={() => {}}
        >
          <Text style={sharedStyles.addText}>＋</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
