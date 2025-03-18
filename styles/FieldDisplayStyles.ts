import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    flexShrink: 1,
    textAlign: "right",
  },
})

export default styles
