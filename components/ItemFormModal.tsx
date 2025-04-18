import { useEffect, useState } from "react"
import { Modal } from "react-native"

import { FieldId, FieldValue, RawField, RawItem } from "@/app/types"

import FieldInput from "./FieldInput"
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
        {fieldOrder.map(fieldId => (
          <FieldInput
            key={fieldId}
            fieldId={fieldId}
            field={fields[fieldId]}
            value={inputValues[fieldId] as FieldValue}
            update={updateField}
          />
        ))}
      </ScrollableModalLayout>
    </Modal>
  )
}
