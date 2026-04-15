import { useState } from "react"
import { TextInput } from "react-native"

import { FieldType } from "@/types"
import FieldWrapper from "@/components/FieldWrapper"
import { InputProps } from "@/fieldRegistry/types"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

export const Input = ({
  autoFocus,
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Text>) => {
  const [value, setValue] = useState(initialValue ?? "")

  return (
    <FieldWrapper label={field.name}>
      <TextInput
        autoFocus={autoFocus}
        style={[sharedStyles.inputCard, modalStyles.buttonInModal]}
        placeholder={field.name}
        value={value}
        onChangeText={text => {
          setValue(text)
          onChange(text)
        }}
      />
    </FieldWrapper>
  )
}
