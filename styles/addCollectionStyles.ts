import { StyleSheet } from "react-native"

export const addCollectionStyles = StyleSheet.create({
  topPanel: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#f2f2f2",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topButtonText: {
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  topCardButton: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  createButton: {
    backgroundColor: "#e0f7fa", // match addCard style
  },
  discardButton: {
    backgroundColor: "#eee", // neutral grey for now
  },
  topActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
})
