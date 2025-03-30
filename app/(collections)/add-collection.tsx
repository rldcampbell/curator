import { sharedStyles } from "@/styles/sharedStyles"
import { addCollectionStyles } from "@/styles/addCollectionStyles"
import { useState } from "react"
import {
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from "react-native"
import AddFieldModal from "@/components/AddFieldModal"
import { genId } from "@/helpers"
import DraggableFlatList from "react-native-draggable-flatlist"
import Divider from "@/components/Divider"

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
      <View style={addCollectionStyles.topPanel}>
        <TextInput
          style={sharedStyles.inputCard}
          placeholder="Collection Name"
          placeholderTextColor="#999"
          value={collectionName}
          onChangeText={setCollectionName}
          maxLength={30}
        />

        <Pressable
          style={[sharedStyles.card, sharedStyles.addCard]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={sharedStyles.addText}>＋</Text>
        </Pressable>
      </View>

      <Divider />

      <View style={{ flex: 1 }}>
        <DraggableFlatList
          data={fieldOrder}
          keyExtractor={item => item}
          onDragEnd={({ data }) => setFieldOrder([...data])}
          contentContainerStyle={addCollectionStyles.listContainer}
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
      </View>

      {modalVisible && (
        <AddFieldModal
          visible={true}
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
