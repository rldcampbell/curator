import { StyleSheet } from "react-native"

import { colors, radii, shadows, spacing } from "./tokens"

export const surfaceStyles = StyleSheet.create({
  card: {
    width: "100%",
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    ...shadows.card,
    alignItems: "center",
    justifyContent: "center",
  },
  inputCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    fontSize: 18,
    ...shadows.card,
  },
})
