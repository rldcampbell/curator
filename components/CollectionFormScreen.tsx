import { useEffect, useRef, useState } from "react"
import { TextInput, View } from "react-native"
import DraggableFlatList from "react-native-draggable-flatlist"

import { router } from "expo-router"

import { Feather } from "@expo/vector-icons"

import { CollectionId, FieldId, RawField } from "@/app/types"
import AddButton from "@/components/AddButton"
import AppText from "@/components/AppText"
import ConfirmModal from "@/components/ConfirmModal"
import FieldFormModal from "@/components/FieldFormModal"
import FullPageLayout from "@/components/FullPageLayout"
import ModalButtonRow from "@/components/ModalButtonRow"
import SwaggableRow from "@/components/SwaggableRow"
import { useCollections } from "@/context/CollectionsContext"
import { genFieldId } from "@/helpers"
import { changeSummary } from "@/helpers/collection"
import { sharedStyles } from "@/styles/sharedStyles"

type Props = {
  mode: "create" | "edit"
  collectionId?: CollectionId
}

export default function CollectionFormScreen({ mode, collectionId }: Props) {
  const { collections, addCollection, updateCollection } = useCollections()
  const existing =
    mode === "edit" && collectionId ? collections[collectionId] : null

  const [collectionName, setCollectionName] = useState(existing?.name ?? "")
  const [fieldOrder, setFieldOrder] = useState<FieldId[]>(
    existing?.fieldOrder ?? [],
  )
  const [fields, setFields] = useState<Record<FieldId, RawField>>(
    existing?.fields ?? {},
  )

  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [editingFieldId, setEditingFieldId] = useState<FieldId | null>(null)

  const [confirmDiscardVisible, setConfirmDiscardVisible] = useState(false)
  const [confirmSubmitVisible, setConfirmSubmitVisible] = useState(false)

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

  const handleSubmitField = (field: RawField) => {
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

  const handleSubmitCollection = () => {
    if (mode === "create") {
      addCollection({ name: collectionName, fieldOrder, fields })
    } else if (collectionId) {
      updateCollection(collectionId, () => ({
        name: collectionName,
        fieldOrder,
        fields,
      }))
    }
    router.back()
  }

  const handleDiscard = () => {
    setConfirmDiscardVisible(false)
    router.back()
  }

  const original =
    mode === "edit" && collectionId ? collections[collectionId] : null
  const isDirty =
    mode === "create" ||
    (original &&
      changeSummary(original, {
        name: collectionName,
        fields,
        fieldOrder,
      }).any)

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
          onDiscard={() => {
            if (isDirty) {
              setConfirmDiscardVisible(true)
            } else {
              // no need to ask for confirmation - no changes
              handleDiscard()
            }
          }}
          discardLabel={isDirty ? "Discard" : "Cancel"}
          onApply={() => setConfirmSubmitVisible(true)}
          applyLabel={mode === "create" ? "Create" : "Save"}
          applyDisabled={!validCollection || !isDirty}
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
          typeUpdateDisabled={modalMode === "edit" && mode === "edit"}
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
        title="Discard changes?"
        message="This will clear all fields and unsaved data."
        confirmText="Discard"
        onConfirm={handleDiscard}
        onCancel={() => setConfirmDiscardVisible(false)}
      />

      <ConfirmModal
        visible={confirmSubmitVisible}
        title={mode === "create" ? "Create collection?" : "Save changes?"}
        message={
          mode === "create"
            ? "You’ll be able to edit this collection and its fields later."
            : "This will update the collection with your changes."
        }
        confirmText={mode === "create" ? "Create" : "Save"}
        onConfirm={handleSubmitCollection}
        onCancel={() => setConfirmSubmitVisible(false)}
      />
    </FullPageLayout>
  )
}
