import { ReactNode } from "react"
import { StyleSheet, View } from "react-native"

import { formStyles } from "@/styles"

import AppText from "./AppText"

type Props = {
  label: string
  children: ReactNode
}

export default function FieldWrapper({ label, children }: Props) {
  return (
    <View style={styles.container}>
      <AppText style={formStyles.label}>{label}</AppText>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 8,
  },
})
