import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import * as FileSystem from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"

import { format } from "date-fns"

import AppText from "@/components/AppText"
import ConfirmModal from "@/components/ConfirmModal"
import { useCollections } from "@/context/CollectionsContext"
import { safeDeleteFile } from "@/helpers/file"
import { resetDatabase } from "@/services/database"
import { colors, layoutStyles, screenStyles, spacing } from "@/styles"

import { CollectionsData } from "@/types"

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
      await safeDeleteFile(fileUri)
    } catch (error) {
      console.warn("Failed to delete temp export file:", error)
    }
  }

  return (
    <View style={[screenStyles.mutedCanvas, layoutStyles.alignCenter, styles.container]}>
      <AppText weight="bold" style={styles.title}>
        Developer Tools
      </AppText>

      <Pressable style={styles.actionButton} onPress={() => setModalVisible(true)}>
        <AppText style={styles.actionText}>Reset Database</AppText>
      </Pressable>

      <Pressable style={styles.actionButton} onPress={handleExportCollections}>
        <AppText style={styles.actionText}>Export Collections</AppText>
      </Pressable>

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

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
  },
  actionButton: {
    width: "100%",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 17,
    color: colors.accent,
  },
})
