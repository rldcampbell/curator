import { Dimensions, StyleSheet } from "react-native"

import { colors, radii } from "./tokens"

const screenWidth = Dimensions.get("window").width

export const modalStyles = StyleSheet.create({
  content: {
    width: screenWidth * 0.9,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    maxHeight: "90%",
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: colors.accentSoft,
  },
  clearButton: {
    backgroundColor: colors.warningSoft,
  },
  closeButton: {
    backgroundColor: colors.borderSubtle,
  },
  buttonInModal: {
    width: "100%",
  },
})
