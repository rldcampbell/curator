import { sharedStyles } from "@/styles/shared"
import { useState } from "react"
import {
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import AddFieldModal from "@/components/AddFieldModal"
import { genId } from "@/helpers"
import DraggableFlatList from "react-native-draggable-flatlist"

export default function AddCollectionScreen() {
  const [collectionName, setCollectionName] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [fieldOrder, setFieldOrder] = useState<string[]>([])
  const [fields, setFields] = useState<
    Record<string, { name: string; type: string }>
  >({})

  return (
    <KeyboardAvoidingView
      style={sharedStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={sharedStyles.scrollContainer}>
        {/* Input for collection name */}
        <TextInput
          style={sharedStyles.inputCard}
          placeholder="Collection Name"
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

        <DraggableFlatList
          data={fieldOrder}
          keyExtractor={item => item}
          onDragEnd={({ data }) => setFieldOrder([...data])}
          scrollEnabled={false} // since we're inside a ScrollView
          renderItem={({ item, drag, isActive }) => {
            const field = fields[item]

            return (
              <TouchableOpacity
                key={item}
                style={[
                  sharedStyles.card,
                  isActive ? sharedStyles.activeCard : null,
                ]}
                onLongPress={drag}
                delayLongPress={300}
              >
                <Text style={sharedStyles.cardText}>
                  {field.name} (
                  {field.type.charAt(0).toUpperCase() + field.type.slice(1)})
                </Text>
              </TouchableOpacity>
            )
          }}
        />
      </ScrollView>
      {modalVisible && (
        <AddFieldModal
          visible={true} // optional — can omit this if you like
          onClose={() => setModalVisible(false)}
          onSubmit={field => {
            const id = genId({ prefix: "f-" })
            setFieldOrder(prev => [...prev, id])
            setFields(prev => ({ ...prev, [id]: field }))
          }}
        />
      )}
    </KeyboardAvoidingView>
  )
}
