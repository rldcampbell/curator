import { useEffect, useState } from "react"
import { Modal, View } from "react-native"

import {
  FieldId,
  FieldValue,
  RawField,
  RawItem,
  Resolvable,
  Resolved,
} from "@/app/types"
import { fieldService } from "@/services/fieldService"

import ModalButtonRow from "./ModalButtonRow"
import ScrollableModalLayout from "./ScrollableModalLayout"

type ItemFormModalProps = {
  mode: "create" | "edit"
  visible: boolean
  initialValues?: RawItem["values"] | undefined
  fieldOrder: FieldId[]
  fields: Record<FieldId, RawField>
  onSubmit: (values: RawItem["values"]) => void
  onDiscard: () => void
}

const resolve = async <T,>(input: Resolvable<T>): Promise<T> => {
  const result = typeof input === "function" ? input() : input

  return await result
}

const resolveObjectValues = async <K extends string, V>(
  obj: Record<K, Resolvable<V>>,
): Promise<Record<K, V>> => {
  const entries = await Promise.all(
    Object.entries(obj).map(
      async ([key, val]) => [key, await resolve(val)] as [K, V],
    ),
  )

  return Object.fromEntries(entries) as Record<K, V>
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
    Record<FieldId, Resolvable<FieldValue>>
  >(initialValues ?? {})

  useEffect(() => {
    if (visible) {
      setInputValues(initialValues ?? {})
    }
  }, [visible, initialValues])

  // Store either a direct value or a thunk (function to be resolved later)
  const updateField = (
    id: FieldId,
    value: Resolvable<FieldValue | undefined>,
  ) => {
    setInputValues(prev => ({ ...prev, [id]: value }))
  }

  // Resolve all values, including any thunks, before submitting
  const handleSubmit = async () => {
    const values = await resolveObjectValues(inputValues)

    onSubmit(values)
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <ScrollableModalLayout
        onRequestClose={onDiscard}
        visible={visible}
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

          return (
            <View key={fieldId} style={{ width: "100%", marginBottom: 8 }}>
              {fieldService.input({
                field,
                initialValue: isResolved(value) ? value : undefined,
                onChange: value => updateField(fieldId, value),
              })}
            </View>
          )
        })}
      </ScrollableModalLayout>
    </Modal>
  )
}

export function isResolved<T>(val: Resolvable<T>): val is Resolved<T> {
  return typeof val !== "function" && !(val instanceof Promise)
}
