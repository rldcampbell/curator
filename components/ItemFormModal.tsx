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
  const [inputValues, setInputValues] = useState<RawItem>({})
  const [activePickerField, setActivePickerField] = useState<FieldId | null>(
    null,
  )

  useEffect(() => {
    if (visible && mode === "edit" && initialValues) {
      setInputValues(initialValues)
    } else if (visible && mode === "create") {
      setInputValues({})
    }
  }, [visible, mode, initialValues])

  const updateField = (id: FieldId, value: FieldValue) => {
    setInputValues(prev => ({ ...prev, [id]: value }))
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <ScrollableModalLayout
        title={mode === "create" ? "New Item" : "Edit Item"}
        footer={
          <ModalButtonRow
            onApply={() => onSubmit(inputValues)}
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
            value={inputValues[fieldId]}
            update={updateField}
            activePickerField={activePickerField}
            setActivePickerField={setActivePickerField}
          />
        ))}
      </ScrollableModalLayout>
    </Modal>
  )
}
