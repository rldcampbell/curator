import { StyleSheet } from "react-native"

export const collectionDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  itemRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  activeItemRow: {
    backgroundColor: "#f0f0f0",
  },
  itemText: {
    fontSize: 16,
    color: "#222",
  },
})
