import { useEffect, useRef, useState } from "react"
import { Alert, Pressable, StyleSheet, View } from "react-native"

import { Feather } from "@expo/vector-icons"

import { FieldType } from "@/types"
import FieldWrapper from "@/components/FieldWrapper"
import ImagePreview from "@/components/ImagePreview"
import { InputProps } from "@/fieldRegistry/types"
import { safeDeleteFile } from "@/helpers/file"
import { pickImageAsset, storeImage, takePhoto } from "@/helpers/image"
import { modalStyles, surfaceStyles } from "@/styles"

export const Input = ({
  field,
  initialValue,
  onChange,
}: InputProps<typeof FieldType.Image>) => {
  const [previewUri, setPreviewUri] = useState<string | undefined>()
  const initialUriRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    const initialUri =
      initialValue && initialValue.length > 0 ? initialValue[0] : undefined

    if (initialUri) {
      if (!initialUriRef.current) {
        initialUriRef.current = initialUri
      }
      if (!previewUri) {
        setPreviewUri(initialUri)
      }
    }
  }, [initialValue, previewUri])

  const handleAddImage = async () => {
    Alert.alert("Add Image", "Choose image source", [
      {
        text: "Take Photo",
        onPress: async () => {
          const captured = await takePhoto()
          if (captured) handleSetImage(captured.uri)
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const picked = await pickImageAsset()
          if (picked) handleSetImage(picked.uri)
        },
      },
      { text: "Cancel", style: "cancel" },
    ])
  }

  const handleSetImage = async (uri: string) => {
    setPreviewUri(uri)

    onChange(async () => {
      const storedUri = await storeImage(uri)
      console.log("[ImageFieldInput] Stored image at:", storedUri)

      const oldUri = initialUriRef.current

      if (oldUri && oldUri !== storedUri) {
        await safeDeleteFile(oldUri)
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
        await safeDeleteFile(oldUri)
        console.log("[ImageFieldInput] Deleted image at:", oldUri)
      }
      return []
    })
  }

  return (
    <FieldWrapper label={field.name}>
      <View
        style={[
          surfaceStyles.inputCard,
          modalStyles.buttonInModal,
          styles.inputSurface,
        ]}
      >
        {previewUri ? (
          <>
            <ImagePreview uri={previewUri} style={styles.preview} />
            <View style={styles.actions}>
              <Pressable onPress={handleAddImage}>
                <Feather name="refresh-ccw" size={24} color="#007AFF" />
              </Pressable>

              <Pressable onPress={handleRemoveImage}>
                <Feather name="trash-2" size={24} color="#FF3B30" />
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable onPress={handleAddImage}>
            <Feather name="image" size={32} color="#999" />
          </Pressable>
        )}
      </View>
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  inputSurface: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 16,
  },
  preview: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 24,
  },
})
