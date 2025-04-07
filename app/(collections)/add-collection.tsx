import { useEffect, useRef, useState } from "react"
import { TextInput, TouchableOpacity, View } from "react-native"
import DraggableFlatList from "react-native-draggable-flatlist"

import { router } from "expo-router"

import AddButton from "@/components/AddButton"
import AddFieldModal from "@/components/AddFieldModal"
import AppText from "@/components/AppText"
import ConfirmModal from "@/components/ConfirmModal"
import FullPageLayout from "@/components/FullPageLayout"
import ModalButtonRow from "@/components/ModalButtonRow"
import { useCollections } from "@/context/CollectionsContext"
import { genFieldId } from "@/helpers"
import { sharedStyles } from "@/styles/sharedStyles"

import { Field, FieldId } from "../types"

export default function AddCollectionScreen() {
  const [collectionName, setCollectionName] = useState("")
  const [fieldOrder, setFieldOrder] = useState<FieldId[]>([])
  const [fields, setFields] = useState<Record<FieldId, Field>>({})

  const [modalVisible, setModalVisible] = useState(false)
  const [confirmDiscardVisible, setConfirmDiscardVisible] = useState(false)
  const [confirmCreateVisible, setConfirmCreateVisible] = useState(false)

  const { addCollection } = useCollections()
  const inputRef = useRef<TextInput>(null)
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [])

  const validCollection =
    collectionName.trim() !== "" && fieldOrder.length !== 0

  return (
    <FullPageLayout
      header={
        <TextInput
          ref={inputRef}
          style={sharedStyles.inputCard}
          placeholder="Collection Name"
          placeholderTextColor="#999"
          value={collectionName}
          onChangeText={setCollectionName}
          maxLength={30}
        />
      }
      footer={
        <ModalButtonRow
          onDiscard={() => setConfirmDiscardVisible(true)}
          discardLabel="Discard"
          onApply={() => setConfirmCreateVisible(true)}
          applyLabel="Create"
          applyDisabled={!validCollection}
        />
      }
    >
      <DraggableFlatList
        ListFooterComponent={
          <View
            style={{
              marginTop: 16,
              alignItems: "center",
              // paddingBottom: 80,
            }}
          >
            <AddButton onPress={() => setModalVisible(true)} />
          </View>
        }
        data={fieldOrder}
        keyExtractor={item => item}
        onDragEnd={({ data }) => setFieldOrder([...data])}
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
              <AppText weight="medium" style={sharedStyles.cardText}>
                {field.name} (
                {field.type.charAt(0).toUpperCase() + field.type.slice(1)})
              </AppText>
            </TouchableOpacity>
          )
        }}
      />
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
    </FullPageLayout>
  )
}
