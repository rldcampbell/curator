import * as FileSystem from "expo-file-system"
import * as ImagePicker from "expo-image-picker"

import { genId } from "@/helpers"

import { getFileExtension } from "./file"

const IMAGES_DIR = `${FileSystem.documentDirectory}images/`

const ensureImagesDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true })
  }
}

export const pickAndStoreImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== "granted") {
    console.warn("Permission to access media library denied")
    return null
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsMultipleSelection: false,
    quality: 0.8,
  })

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null
  }

  const picked = result.assets[0]
  const originalUri = picked.uri

  await ensureImagesDirExists()

  const ext = getFileExtension(originalUri)
  const fileId = genId({ prefix: "img-" })
  const filename = `${fileId}.${ext}`
  const destination = `${IMAGES_DIR}${filename}`

  await FileSystem.copyAsync({
    from: originalUri,
    to: destination,
  })

  return destination
}
