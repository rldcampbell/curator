import { useEffect, useRef, useState } from "react"
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import DraggableFlatList from "react-native-draggable-flatlist"

import { router } from "expo-router"

import AddButton from "@/components/AddButton"
import AddFieldModal from "@/components/AddFieldModal"
import ConfirmModal from "@/components/ConfirmModal"
import Divider from "@/components/Divider"
import { useCollections } from "@/context/CollectionsContext"
import { genFieldId } from "@/helpers"
import { addCollectionStyles } from "@/styles/addCollectionStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import { Field, FieldId } from "../types"

export default function AddCollectionScreen() {
  const [collectionName, setCollectionName] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [fieldOrder, setFieldOrder] = useState<FieldId[]>([])
  const [fields, setFields] = useState<Record<FieldId, Field>>({})
  const [confirmDiscardVisible, setConfirmDiscardVisible] = useState(false)
  const [confirmCreateVisible, setConfirmCreateVisible] = useState(false)
  const { addCollection } = useCollections()
  const inputRef = useRef<TextInput>(null)
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [])

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
            ref={inputRef}
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
            addCollection({
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
    </TouchableWithoutFeedback>
  )
}
