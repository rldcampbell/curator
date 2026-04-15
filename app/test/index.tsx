import React, { useEffect, useState } from "react"
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"

import * as SQLite from "expo-sqlite"

import AppText from "@/components/AppText"
import MultiWheelPicker from "@/components/MultiWheelPicker"

// adjust path if needed

const TestScreen = () => {
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [testTime, setTestTime] = useState<(number | undefined)[]>([0, 0, 0])

  useEffect(() => {
    fetchTable()
  }, [])

  const fetchTable = async () => {
    try {
      const db = await SQLite.openDatabaseAsync("curator.db")
      const results = [
        "COLLECTIONS",
        ...(await db.getAllAsync("SELECT * FROM collections")),
        "FIELDS",
        ...(await db.getAllAsync("SELECT * FROM fields")),
        "ITEMS",
        ...(await db.getAllAsync("SELECT * FROM items")),
        "ITEM_VALUES",
        ...(await db.getAllAsync("SELECT * FROM item_values")),
      ]
      const result = await db.getAllAsync("SELECT * FROM meta")
      console.log("[TEST] Meta table contents:", result)

      setRows(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.testPickerContainer}>
        <AppText style={styles.testTitle}>
          ⏰ Test Picker (Hours, Minutes, Seconds)
        </AppText>
        <MultiWheelPicker
          pickers={[
            { min: 0, max: 999, label: "hrs" },
            { min: 0, max: 59, label: "min" },
            { min: 0, max: 59, label: "sec" },
          ]}
          value={testTime}
          onChange={setTestTime}
          gap={12}
        />
        <AppText style={styles.testValue}>
          Selected: {testTime.join(" : ")}
        </AppText>
      </View>

      <View style={styles.header}>
        <AppText style={styles.title}>📦 collections Table</AppText>
        <Button title="Refresh" onPress={fetchTable} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {error && <AppText style={styles.error}>Error: {error}</AppText>}
        {rows.map((row, index) => (
          <View key={index} style={styles.row}>
            <AppText style={styles.json}>
              {JSON.stringify(row, null, 2)}
            </AppText>
          </View>
        ))}
        {rows.length === 0 && !error && (
          <AppText style={styles.noRows}>No collections found</AppText>
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
  testPickerContainer: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  testValue: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Courier",
    textAlign: "center",
  },
})
