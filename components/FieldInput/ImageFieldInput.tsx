import { useEffect, useState } from "react"
import { Image, Pressable, View } from "react-native"

import * as FileSystem from "expo-file-system"

import { Feather } from "@expo/vector-icons"

import { FieldType } from "@/app/types"
import { pickAndStoreImage } from "@/helpers/image"
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
  const uri = value?.[0]
  const [aspectRatio, setAspectRatio] = useState(1)

  useEffect(() => {
    if (!uri) return
    Image.getSize(
      uri,
      (width, height) => {
        setAspectRatio(width / height)
      },
      error => {
        console.warn("Could not get image size", error)
        setAspectRatio(1)
      },
    )
  }, [uri])

  const handlePickImage = async () => {
    const newUri = await pickAndStoreImage()
    if (!newUri) return

    if (uri) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true })
      } catch (err) {
        console.warn("Failed to delete previous image", err)
      }
    }

    update(fieldId, [newUri])
  }

  const handleRemoveImage = async () => {
    if (!uri) return
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true })
    } catch (err) {
      console.warn("Failed to delete image", err)
    }
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
        {uri ? (
          <>
            <Image
              source={{ uri }}
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
