import { TextInput } from "react-native"

import { FieldType } from "@/app/types"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import FieldWrapper from "./FieldWrapper"
import { FieldInputProps } from "./types"

export default function NumberFieldInput({
  fieldId,
  field,
  value,
  update,
}: FieldInputProps<typeof FieldType.Number>) {
  return (
    <FieldWrapper label={field.name}>
      <TextInput
        style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
        placeholder={field.name}
        value={value?.toString() ?? ""}
        keyboardType="numeric"
        onChangeText={text => update(fieldId, parseFloat(text))}
      />
    </FieldWrapper>
  )
}
