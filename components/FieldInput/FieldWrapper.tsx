import { ReactNode } from "react"
import { View } from "react-native"

import { sharedStyles } from "@/styles/sharedStyles"

import AppText from "../AppText"

type Props = {
  label: string
  children: ReactNode
}

export default function FieldWrapper({ label, children }: Props) {
  return (
    <View style={{ width: "100%", marginBottom: 8 }}>
      <AppText style={sharedStyles.label}>{label}</AppText>
      {children}
    </View>
  )
}
