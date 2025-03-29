import { sharedStyles } from "@/styles/shared"
import { modalStyles } from "@/styles/modalStyles"
import { useState } from "react"
import {
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  View,
} from "react-native"

export default function AddCollectionScreen() {
  const [collectionName, setCollectionName] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

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
          onPress={() => setModalVisible(true)}
        >
          <Text style={sharedStyles.addText}>＋</Text>
        </Pressable>
      </ScrollView>

      {/* Modal for adding a field */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <Text style={modalStyles.title}>Add Field</Text>

            <Text>Field name and type picker coming soon!</Text>

            <Pressable
              style={[sharedStyles.card, modalStyles.closeButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ fontWeight: "bold", color: "#333" }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}
