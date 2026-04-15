import { useState } from "react"
import { TextInput } from "react-native"

import { FieldType } from "@/types"
import FieldWrapper from "@/components/FieldWrapper"
import { InputProps } from "@/fieldRegistry/types"
import { modalStyles, surfaceStyles } from "@/styles"

export const Input = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Number>) => {
  const [value, setValue] = useState(
    initialValue !== undefined ? initialValue.toString() : "",
  )

  return (
    <FieldWrapper label={field.name}>
      <TextInput
        style={[surfaceStyles.inputCard, modalStyles.buttonInModal]}
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
