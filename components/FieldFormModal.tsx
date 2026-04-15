import { useEffect, useRef, useState } from "react"
import { StyleSheet, TextInput, View } from "react-native"
import DropDownPicker from "react-native-dropdown-picker"

import { FieldType, RawField } from "@/types"
import { fieldRegistry } from "@/fieldRegistry"
import { fieldService } from "@/services/fieldService"
import { formStyles, modalStyles, stateStyles, surfaceStyles } from "@/styles"

import AppText from "./AppText"
import CompactModalLayout from "./CompactModalLayout"
import ModalButtonRow from "./ModalButtonRow"

type FieldFormModalProps = {
  mode: "create" | "edit"
  visible: boolean
  initialValues?: RawField | undefined
  typeUpdateDisabled?: boolean
  onClose: () => void
  onSubmit: (field: RawField) => void
}

export default function FieldFormModal({
  mode,
  visible,
  initialValues,
  typeUpdateDisabled,
  onClose,
  onSubmit,
}: FieldFormModalProps) {
  const [open, setOpen] = useState(false)

  const [field, setField] = useState<RawField>({
    name: "",
    type: FieldType.Text,
    config: fieldRegistry[FieldType.Text].defaultConfig,
  })

  const inputRef = useRef<TextInput>(null)

  const items = Object.entries(fieldRegistry).map(([type, { label }]) => ({
    label,
    value: type as FieldType,
  }))

  const handleTypeChange = (value: (prevState: FieldType) => FieldType) => {
    const resolved = value(field.type) as FieldType
    setField(
      f =>
        ({
          ...f,
          type: resolved,
          config: fieldRegistry[resolved].defaultConfig,
        }) as RawField,
    )
  }

  // Populate or reset field on modal open
  useEffect(() => {
    if (visible) {
      if (mode === "edit" && initialValues) {
        setField(initialValues)
      } else {
        setField({
          name: "",
          type: FieldType.Text,
          config: fieldRegistry[FieldType.Text].defaultConfig,
        })
      }

      // Autofocus
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [visible, mode, initialValues])

  const handleSubmit = () => {
    if (!field.name.trim()) return
    onSubmit(field)
    onClose()
  }

  return (
    <CompactModalLayout
      visible={visible}
      onRequestClose={onClose}
      title={mode === "create" ? "Add Field" : "Edit Field"}
      footer={
        <ModalButtonRow
          onApply={handleSubmit}
          applyLabel={mode === "create" ? "Add Field" : "Update Field"}
          onDiscard={onClose}
          discardLabel="Cancel"
        />
      }
    >
      <View style={styles.nameFieldBlock}>
        <AppText style={formStyles.label}>Field Name</AppText>
        <TextInput
          ref={inputRef}
          style={[surfaceStyles.inputCard, modalStyles.buttonInModal]}
          placeholder="e.g. Title"
          placeholderTextColor="#999"
          value={field.name}
          onChangeText={name => setField(f => ({ ...f, name }))}
          maxLength={50}
        />
      </View>

      <View
        style={[
          styles.typeFieldBlock,
          typeUpdateDisabled ? stateStyles.disabled : null,
        ]}
      >
        <AppText style={formStyles.label}>Field Type</AppText>
        <DropDownPicker
          {...(typeUpdateDisabled !== undefined
            ? { disabled: typeUpdateDisabled }
            : null)}
          open={open}
          value={field.type}
          items={items}
          setOpen={setOpen}
          setValue={handleTypeChange}
          style={formStyles.dropdown}
          containerStyle={styles.fullWidth}
          dropDownContainerStyle={formStyles.dropdownMenu}
        />
      </View>

      {fieldRegistry[field.type].configInput && (
        <View style={styles.typeFieldBlock}>
          {fieldService.configInput({
            type: field.type,
            config: field.config,
            onConfigChange: config =>
              setField(
                f =>
                  ({
                    ...f,
                    config,
                  }) as RawField,
              ),
          })}
        </View>
      )}
    </CompactModalLayout>
  )
}

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
  nameFieldBlock: {
    width: "100%",
    marginBottom: 12,
  },
  typeFieldBlock: {
    width: "100%",
    marginBottom: 24,
  },
})
