import { useEffect, useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"

import { radii } from "@/styles"

type ImagePreviewProps = {
  uri: string
  style?: StyleProp<ImageStyle>
}

export default function ImagePreview({ uri, style }: ImagePreviewProps) {
  const [aspectRatio, setAspectRatio] = useState(1)

  useEffect(() => {
    Image.getSize(
      uri,
      (width, height) => setAspectRatio(width / height),
      error => {
        console.warn("ImagePreview: could not get image size", error)
        setAspectRatio(1)
      },
    )
  }, [uri])

  return (
    <Image
      source={{ uri }}
      style={[styles.image, { aspectRatio }, style]}
      resizeMode="cover"
    />
  )
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    borderRadius: radii.sm,
  },
})
