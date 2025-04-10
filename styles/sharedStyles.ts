// styles/shared.ts
import { StyleSheet } from "react-native"

export const sharedStyles = StyleSheet.create({
  title: {
    fontSize: 24,
  },
  addCard: {
    backgroundColor: "#e0f7fa",
  },
  addText: {
    fontSize: 32,
    color: "#007aff",
  },
  card: {
    width: "100%",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    fontSize: 18,
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
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    fontSize: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    padding: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  disabled: {
    opacity: 0.5,
  },
})
