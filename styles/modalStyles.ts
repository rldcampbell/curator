import { StyleSheet, Dimensions } from "react-native"

const screenWidth = Dimensions.get("window").width

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: screenWidth * 0.9,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#eee",
  },
})
