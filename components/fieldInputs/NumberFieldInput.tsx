import { useState } from "react"
import { TextInput } from "react-native"

import { FieldType } from "@/app/types"
import { InputProps } from "@/fieldRegistry/types"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import FieldWrapper from "./FieldWrapper"

export default function NumberFieldInput({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Number>) {
  const [value, setValue] = useState(
    initialValue !== undefined ? initialValue.toString() : "",
  )

  return (
    <FieldWrapper label={field.name}>
      <TextInput
        style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
        placeholder={field.name}
        keyboardType="numeric"
        value={value}
        onChangeText={text => {
          setValue(text)
          const parsed = parseFloat(text)
          onChange(isNaN(parsed) ? undefined : parsed)
        }}
      />
    </FieldWrapper>
  )
}
