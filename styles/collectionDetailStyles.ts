import { StyleSheet } from "react-native"

import { colors, spacing } from "./tokens"

export const collectionDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  itemText: {
    fontSize: 16,
    color: colors.textBody,
  },
})
