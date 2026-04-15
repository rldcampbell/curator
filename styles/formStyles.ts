import { StyleSheet } from "react-native"

import { colors, radii, spacing } from "./tokens"

export const formStyles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: spacing.xs,
    color: colors.textLabel,
  },
  dropdown: {
    borderRadius: radii.sm,
    borderColor: colors.borderInput,
  },
  dropdownMenu: {
    borderRadius: radii.sm,
    borderColor: colors.borderInput,
  },
})
