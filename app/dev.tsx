import { useState } from "react"
import { View } from "react-native"

import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"

import { format } from "date-fns"

import AddButton from "@/components/AddButton"
import AppText from "@/components/AppText"
import ConfirmModal from "@/components/ConfirmModal"
import { useCollections } from "@/context/CollectionsContext"
import { resetDatabase } from "@/services/database"
import { sharedStyles } from "@/styles/sharedStyles"

import { CollectionsData } from "./types"

export default function DevScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const { collectionOrder, collections } = useCollections()

  const handleExportCollections = async () => {
    const collectionsData: CollectionsData = {
      collectionOrder,
      collections,
    }

    const json = JSON.stringify(collectionsData, null, 2)

    const timestamp = format(new Date(), "yyyy-MM-dd-HH-mm-ss")
    const filename = `collections-backup-${timestamp}.json`
    const fileUri = `${FileSystem.documentDirectory}${filename}`

    await FileSystem.writeAsStringAsync(fileUri, json, {
      encoding: FileSystem.EncodingType.UTF8,
    })

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export Collections Backup",
      })
    } else {
      console.warn("Sharing not available on this device")
    }

    // clean-up
    try {
      await FileSystem.deleteAsync(fileUri)
    } catch (error) {
      console.warn("Failed to delete temp export file:", error)
    }
  }

  return (
    <View style={sharedStyles.container}>
      <AppText weight="bold" style={sharedStyles.title}>
        Developer Tools
      </AppText>

      <AddButton onPress={() => setModalVisible(true)} label="Reset Database" />
      <AddButton label="Export Collections" onPress={handleExportCollections} />

      {modalVisible && (
        <ConfirmModal
          visible={true}
          onCancel={() => setModalVisible(false)}
          onConfirm={resetDatabase}
          title="Reset database?"
          message="Are you sure you want to delete all data and reset the database?"
        />
      )}
    </View>
  )
}
