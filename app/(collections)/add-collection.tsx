import { useEffect, useRef, useState } from "react"
import { TextInput, View } from "react-native"
import DraggableFlatList from "react-native-draggable-flatlist"

import { router } from "expo-router"

import { Feather } from "@expo/vector-icons"

import AddButton from "@/components/AddButton"
import AppText from "@/components/AppText"
import ConfirmModal from "@/components/ConfirmModal"
import FieldFormModal from "@/components/FieldFormModal"
import FullPageLayout from "@/components/FullPageLayout"
import ModalButtonRow from "@/components/ModalButtonRow"
import SwaggableRow from "@/components/SwaggableRow"
import { useCollections } from "@/context/CollectionsContext"
import { genFieldId } from "@/helpers"
import { sharedStyles } from "@/styles/sharedStyles"

import { Field, FieldId } from "../types"

export default function AddCollectionScreen() {
  const [collectionName, setCollectionName] = useState("")
  const [fieldOrder, setFieldOrder] = useState<FieldId[]>([])
  const [fields, setFields] = useState<Record<FieldId, Field>>({})

  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [editingFieldId, setEditingFieldId] = useState<FieldId | null>(null)

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

  const handleOpenCreateField = () => {
    setModalMode("create")
    setEditingFieldId(null)
    setModalVisible(true)
  }

  const handleOpenEditField = (id: FieldId) => {
    setModalMode("edit")
    setEditingFieldId(id)
    setModalVisible(true)
  }

  const handleSubmitField = (field: { name: string; type: string }) => {
    if (modalMode === "create") {
      const id = genFieldId()
      setFieldOrder(prev => [...prev, id])
      setFields(prev => ({ ...prev, [id]: field }))
    } else if (editingFieldId) {
      setFields(prev => ({ ...prev, [editingFieldId]: field }))
    }

    setModalVisible(false)
    setEditingFieldId(null)
  }

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
          <View style={{ marginTop: 8, alignItems: "center" }}>
            <AddButton onPress={handleOpenCreateField} />
          </View>
        }
        data={fieldOrder}
        keyExtractor={id => id}
        onDragEnd={({ data }) => setFieldOrder([...data])}
        renderItem={({ item, drag, isActive }) => {
          const field = fields[item]

          const buttons = [
            {
              icon: <Feather name="edit-3" size={20} color="black" />,
              onPress: () => handleOpenEditField(item),
            },
            {
              icon: <Feather name="trash-2" size={20} color="black" />,
              onPress: () => {
                setFields(prev => {
                  const updated = { ...prev }
                  delete updated[item]
                  return updated
                })
                setFieldOrder(prev => prev.filter(id => id !== item))
              },
              backgroundColor: "#e74c3c",
            },
          ]

          return (
            <SwaggableRow
              item={item}
              onDrag={drag}
              buttons={buttons}
              onPress={() => {}}
              renderContent={() => (
                <View
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    backgroundColor: isActive ? "#f0f0f0" : "#fff",
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                  }}
                >
                  <AppText weight="medium">
                    {field.name} (
                    {field.type.charAt(0).toUpperCase() + field.type.slice(1)})
                  </AppText>
                </View>
              )}
            />
          )
        }}
      />

      {modalVisible && (
        <FieldFormModal
          mode={modalMode}
          visible
          onClose={() => setModalVisible(false)}
          initialValues={
            modalMode === "edit" && editingFieldId
              ? fields[editingFieldId]
              : undefined
          }
          onSubmit={handleSubmitField}
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
        message="You’ll be able to edit this collection and its fields later."
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
