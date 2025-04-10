import { Dimensions, StyleSheet } from "react-native"

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
    backgroundColor: "white",
    borderRadius: 16,
    // margin: 16,
    maxHeight: "90%",
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#e0f7fa",
  },
  closeButton: {
    backgroundColor: "#eee",
  },
  buttonInModal: {
    width: "100%",
  },
})
