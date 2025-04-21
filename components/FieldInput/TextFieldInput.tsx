import { TextInput } from "react-native"

import { FieldType } from "@/app/types"
import { InputProps } from "@/fieldRegistry/types"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import FieldWrapper from "./FieldWrapper"

export default function TextFieldInput({
  fieldId,
  field,
  value,
  update,
}: InputProps<typeof FieldType.Text>) {
  return (
    <FieldWrapper label={field.name}>
      <TextInput
        style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
        placeholder={field.name}
        value={value}
        onChangeText={text => update(fieldId, text)}
      />
    </FieldWrapper>
  )
}
