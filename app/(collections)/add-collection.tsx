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
import { genFieldId } from "@/helpers"
import DraggableFlatList from "react-native-draggable-flatlist"
import Divider from "@/components/Divider"
import ConfirmModal from "@/components/ConfirmModal"
import { useCollections } from "@/context/CollectionsContext"
import { router } from "expo-router"
import { Field, FieldId } from "../types"
import AddButton from "@/components/AddButton"

export default function AddCollectionScreen() {
  const [collectionName, setCollectionName] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [fieldOrder, setFieldOrder] = useState<FieldId[]>([])
  const [fields, setFields] = useState<Record<FieldId, Field>>({})
  const [confirmDiscardVisible, setConfirmDiscardVisible] = useState(false)
  const [confirmCreateVisible, setConfirmCreateVisible] = useState(false)
  const { saveCollection } = useCollections()

  return (
    <KeyboardAvoidingView
      style={sharedStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={addCollectionStyles.topPanel}>
        <View style={addCollectionStyles.topActionsRow}>
          <Pressable
            style={[
              addCollectionStyles.topCardButton,
              addCollectionStyles.discardButton,
            ]}
            onPress={() => setConfirmDiscardVisible(true)}
          >
            <Text style={addCollectionStyles.topButtonText}>Discard</Text>
          </Pressable>

          <Pressable
            style={[
              addCollectionStyles.topCardButton,
              addCollectionStyles.createButton,
            ]}
            onPress={() => setConfirmCreateVisible(true)}
          >
            <Text style={addCollectionStyles.topButtonText}>Create</Text>
          </Pressable>
        </View>

        <TextInput
          style={sharedStyles.inputCard}
          placeholder="Collection Name"
          placeholderTextColor="#999"
          value={collectionName}
          onChangeText={setCollectionName}
          maxLength={30}
        />

        <AddButton onPress={() => setModalVisible(true)} />
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
            const id = genFieldId()
            setFieldOrder(prev => [...prev, id])
            setFields(prev => ({ ...prev, [id]: field }))
          }}
        />
      )}

      <ConfirmModal
        visible={confirmDiscardVisible}
        title="Discard collection?"
        message="This will clear all fields you've added."
        confirmText="Discard"
        onConfirm={() => {
          setConfirmDiscardVisible(false)
          router.back()
        }}
        onCancel={() => setConfirmDiscardVisible(false)}
      />

      <ConfirmModal
        visible={confirmCreateVisible}
        title="Create collection?"
        message="You won't be able to edit fields later (yet)."
        confirmText="Create"
        onConfirm={() => {
          saveCollection({
            name: collectionName,
            fieldOrder,
            fields,
          })
          setConfirmCreateVisible(false)
          router.back()
        }}
        onCancel={() => setConfirmCreateVisible(false)}
      />
    </KeyboardAvoidingView>
  )
}
