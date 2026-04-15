import { useState } from "react"
import { TextInput } from "react-native"

import { FieldType } from "@/types"
import FieldWrapper from "@/components/FieldWrapper"
import { InputProps } from "@/fieldRegistry/types"
import { modalStyles, surfaceStyles } from "@/styles"

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
        style={[surfaceStyles.inputCard, modalStyles.buttonInModal]}
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
