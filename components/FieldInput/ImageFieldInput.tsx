import { useEffect, useRef, useState } from "react"
import { Pressable, View } from "react-native"

import * as FileSystem from "expo-file-system"

import { Feather } from "@expo/vector-icons"

import { FieldType } from "@/app/types"
import { InputProps } from "@/fieldRegistry/types"
import { pickImageAsset, storeImage } from "@/helpers/image"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import ImagePreview from "../ImagePreview"
import FieldWrapper from "./FieldWrapper"

export default function ImageFieldInput({
  fieldId,
  field,
  value,
  update,
}: InputProps<typeof FieldType.Image>) {
  const [previewUri, setPreviewUri] = useState<string | undefined>()

  // Remember the original image URI on mount (if any)
  const initialUriRef = useRef<string | undefined>()

  useEffect(() => {
    if (
      !initialUriRef.current &&
      value &&
      typeof value !== "function" &&
      value.length > 0
    ) {
      initialUriRef.current = value[0]
    }
  }, [value])

  useEffect(() => {
    // If a new image has been picked, keep using previewUri
    if (previewUri) return

    // Fallback to existing value if available
    if (value && typeof value !== "function" && value.length > 0) {
      setPreviewUri(value[0])
    }
  }, [value, previewUri])

  const handlePickImage = async () => {
    const picked = await pickImageAsset()
    if (!picked) return

    setPreviewUri(picked.uri)

    update(fieldId, async () => {
      const storedUri = await storeImage(picked.uri)
      console.log("[ImageFieldInput] Stored image at:", storedUri)

      const oldUri = initialUriRef.current
      if (oldUri && oldUri !== storedUri) {
        await FileSystem.deleteAsync(oldUri, { idempotent: true })
        console.log("[ImageFieldInput] Deleted old image at:", oldUri)
      }
      return [storedUri]
    })
  }

  const handleRemoveImage = async () => {
    setPreviewUri(undefined)
    update(fieldId, async () => {
      const oldUri = initialUriRef.current
      if (oldUri) {
        await FileSystem.deleteAsync(oldUri, { idempotent: true })
        console.log("[ImageFieldInput] Deleted image at:", oldUri)
      }
      return []
    })
  }

  return (
    <FieldWrapper label={field.name}>
      <View
        style={[
          sharedStyles.inputCard,
          modalStyles.buttonInModal,
          {
            flexDirection: "column",
            alignItems: "center",
            paddingVertical: 16,
          },
        ]}
      >
        {previewUri ? (
          <>
            <ImagePreview uri={previewUri} style={{ marginBottom: 12 }} />
            <View style={{ flexDirection: "row", gap: 24 }}>
              <Pressable onPress={handlePickImage}>
                <Feather name="refresh-ccw" size={24} color="#007AFF" />
              </Pressable>
              <Pressable onPress={handleRemoveImage}>
                <Feather name="trash-2" size={24} color="#FF3B30" />
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable onPress={handlePickImage}>
            <Feather name="image" size={32} color="#999" />
          </Pressable>
        )}
      </View>
    </FieldWrapper>
  )
}
