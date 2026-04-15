import { StyleSheet } from "react-native"

import { colors } from "./tokens"

export const sharedFieldStyles = StyleSheet.create({
  valueContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  value: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "right",
  },
})
