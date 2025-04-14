import React, { useEffect, useState } from "react"
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"

import * as SQLite from "expo-sqlite"

const TestScreen = () => {
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTable()
  }, [])

  const fetchTable = async () => {
    try {
      const db = await SQLite.openDatabaseAsync("curator.db")
      const results = await db.getAllAsync("SELECT * FROM collections")
      const result = await db.getAllAsync("SELECT * FROM meta")
      console.log("[TEST] Meta table contents:", result)

      setRows(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📦 collections Table</Text>
        <Button title="Refresh" onPress={fetchTable} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {error && <Text style={styles.error}>Error: {error}</Text>}
        {rows.map((row, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.json}>{JSON.stringify(row, null, 2)}</Text>
          </View>
        ))}
        {rows.length === 0 && !error && (
          <Text style={styles.noRows}>No collections found</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default TestScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  scroll: {
    padding: 16,
  },
  row: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f6f8fa",
    borderRadius: 6,
  },
  json: {
    fontFamily: "Courier",
    fontSize: 13,
    color: "#333",
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
  noRows: {
    fontStyle: "italic",
    color: "#888",
  },
})
