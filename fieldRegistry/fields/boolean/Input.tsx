import { Switch, View } from "react-native"

import { FieldType } from "@/app/types"
import FieldWrapper from "@/components/FieldWrapper"
import { InputProps } from "@/fieldRegistry/types"

export const Input = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Boolean>) => {
  return (
    <FieldWrapper label={field.name}>
      <View style={{ alignSelf: "flex-start" }}>
        <Switch value={!!initialValue} onValueChange={val => onChange(val)} />
      </View>
    </FieldWrapper>
  )
}
