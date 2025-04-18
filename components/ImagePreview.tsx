import { useEffect, useState } from "react"
import { Image, ImageStyle, StyleProp } from "react-native"

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
      style={[{ width: "100%", aspectRatio, borderRadius: 12 }, style]}
      resizeMode="cover"
    />
  )
}
