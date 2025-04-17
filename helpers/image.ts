import * as FileSystem from "expo-file-system"
import * as ImageManipulator from "expo-image-manipulator"
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

  // Force the destination extension to match the actual manipulated format (JPEG or PNG only)
  const [outputFormat, formatExt] =
    ext === "png"
      ? [ImageManipulator.SaveFormat.PNG, "png"]
      : [ImageManipulator.SaveFormat.JPEG, "jpg"]

  const filename = `${fileId}.${formatExt}`
  const destination = `${IMAGES_DIR}${filename}`

  const manipulated = await ImageManipulator.manipulateAsync(
    originalUri,
    [{ resize: { width: 1024 } }],
    {
      compress: 0.8,
      format: outputFormat,
      base64: false,
    },
  )

  await FileSystem.copyAsync({
    from: manipulated.uri,
    to: destination,
  })

  return destination
}
