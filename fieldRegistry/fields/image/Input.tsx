import { useEffect, useRef, useState } from "react"
import { Pressable, View } from "react-native"

import * as FileSystem from "expo-file-system"

import { Feather } from "@expo/vector-icons"

import { FieldType } from "@/app/types"
import FieldWrapper from "@/components/FieldWrapper"
import ImagePreview from "@/components/ImagePreview"
import { InputProps } from "@/fieldRegistry/types"
import { pickImageAsset, storeImage } from "@/helpers/image"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

export const Input = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Image>) => {
  const [previewUri, setPreviewUri] = useState<string | undefined>()
  const initialUriRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    const initialUri =
      initialValue &&
      typeof initialValue !== "function" &&
      initialValue.length > 0
        ? initialValue[0]
        : undefined

    if (initialUri) {
      if (!initialUriRef.current) {
        initialUriRef.current = initialUri
      }
      if (!previewUri) {
        setPreviewUri(initialUri)
      }
    }
  }, [initialValue, previewUri])

  const handlePickImage = async () => {
    const picked = await pickImageAsset()
    if (!picked) return

    setPreviewUri(picked.uri)

    onChange(async () => {
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

    onChange(async () => {
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
