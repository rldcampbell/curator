import { useEffect, useState } from "react"
import { Image, Pressable, View } from "react-native"

import { Feather } from "@expo/vector-icons"

import { FieldType } from "@/app/types"
import { pickImageAsset, storeImage } from "@/helpers/image"
import { modalStyles } from "@/styles/modalStyles"
import { sharedStyles } from "@/styles/sharedStyles"

import FieldWrapper from "./FieldWrapper"
import { FieldInputProps } from "./types"

export default function ImageFieldInput({
  fieldId,
  field,
  value,
  update,
}: FieldInputProps<typeof FieldType.Image>) {
  const [previewUri, setPreviewUri] = useState<string | undefined>()
  const [aspectRatio, setAspectRatio] = useState(1)

  useEffect(() => {
    // If a new image has been picked, keep using previewUri
    if (previewUri) return

    // Fallback to existing value if available
    if (value && typeof value !== "function" && value.length > 0) {
      setPreviewUri(value[0])
    }
  }, [value, previewUri])

  useEffect(() => {
    if (previewUri) {
      Image.getSize(
        previewUri,
        (width, height) => {
          setAspectRatio(width / height)
        },
        error => {
          console.warn("Could not get image size", error)
          setAspectRatio(1)
        },
      )
    }
  }, [previewUri])

  const handlePickImage = async () => {
    const picked = await pickImageAsset()
    if (!picked) return

    setPreviewUri(picked.uri)

    update(fieldId, async () => {
      const storedUri = await storeImage(picked.uri)
      return [storedUri]
    })
  }

  const handleRemoveImage = async () => {
    setPreviewUri(undefined)
    update(fieldId, [])
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
            <Image
              source={{ uri: previewUri }}
              style={{
                width: "100%",
                aspectRatio,
                borderRadius: 12,
                marginBottom: 12,
              }}
              resizeMode="cover"
            />
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
