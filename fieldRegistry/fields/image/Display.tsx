import ImagePreview from "@/components/ImagePreview"

export const Display = ({ value }: { value?: string[] | undefined }) => {
  if (!value || value.length === 0) return null

  return <ImagePreview uri={value[0]} />
}
