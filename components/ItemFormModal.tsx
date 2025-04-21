import { useEffect, useState } from "react"
import { Modal, View } from "react-native"

import {
  FieldId,
  FieldValue,
  RawField,
  RawFieldAndValue,
  RawItem,
} from "@/app/types"
import { fieldService } from "@/services/fieldService"

import ModalButtonRow from "./ModalButtonRow"
import ScrollableModalLayout from "./ScrollableModalLayout"

type ItemFormModalProps = {
  mode: "create" | "edit"
  visible: boolean
  initialValues?: RawItem
  fieldOrder: FieldId[]
  fields: Record<FieldId, RawField>
  onSubmit: (item: RawItem) => void
  onDiscard: () => void
}

export default function ItemFormModal({
  mode,
  visible,
  initialValues,
  fieldOrder,
  fields,
  onSubmit,
  onDiscard,
}: ItemFormModalProps) {
  // Allow values to be either actual field values or thunks (functions that return values)
  const [inputValues, setInputValues] = useState<
    Record<FieldId, FieldValue | (() => FieldValue | Promise<FieldValue>)>
  >({})

  useEffect(() => {
    if (visible && mode === "edit" && initialValues) {
      setInputValues(initialValues)
    } else if (visible && mode === "create") {
      setInputValues({})
    }
  }, [visible, mode, initialValues])

  // Store either a direct value or a thunk (function to be resolved later)
  const updateField = (
    id: FieldId,
    value: FieldValue | (() => FieldValue | Promise<FieldValue>),
  ) => {
    setInputValues(prev => ({ ...prev, [id]: value }))
  }

  // Resolve all values, including any thunks, before submitting
  const handleSubmit = async () => {
    const resolved: RawItem = {}
    for (const [id, val] of Object.entries(inputValues)) {
      if (typeof val === "function") {
        resolved[id as FieldId] = await val()
      } else {
        resolved[id as FieldId] = val
      }
    }
    onSubmit(resolved)
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <ScrollableModalLayout
        title={mode === "create" ? "New Item" : "Edit Item"}
        footer={
          <ModalButtonRow
            onApply={handleSubmit}
            applyLabel={mode === "create" ? "Create" : "Update"}
            onDiscard={onDiscard}
          />
        }
      >
        {fieldOrder.map(fieldId => {
          const field = fields[fieldId]
          const value = inputValues[fieldId]
          const fieldWithValue = { ...field, value } as RawFieldAndValue
          return (
            <View key={fieldId} style={{ width: "100%", marginBottom: 8 }}>
              {fieldService.input(fieldWithValue, fieldId, updateField)}
            </View>
          )
        })}
      </ScrollableModalLayout>
    </Modal>
  )
}
