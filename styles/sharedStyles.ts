// styles/shared.ts
import { Dimensions, StyleSheet } from "react-native"

const screenWidth = Dimensions.get("window").width

export const sharedStyles = StyleSheet.create({
  addCard: {
    backgroundColor: "#e0f7fa",
  },
  addText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007aff",
  },
  card: {
    width: screenWidth * 0.9,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    fontSize: 18,
    fontWeight: "500",
  },
  activeCard: {
    backgroundColor: "#d0f0ff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  inputCard: {
    width: screenWidth * 0.9,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  shadowFade: {
    height: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 1,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
})
