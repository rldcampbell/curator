import ImagePreview from "@/components/ImagePreview"

export const ImageDisplay = ({ value }: { value?: string[] }) => {
  if (!value || value.length === 0) return null

  return <ImagePreview uri={value[0]} />
}
