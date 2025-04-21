// fieldRegistry/text/display.tsx
import AppText from "@/components/AppText"

export const TextDisplay = ({ value }: { value?: string }) => (
  <AppText style={{ fontSize: 16, color: "#555", textAlign: "right" }}>
    {value}
  </AppText>
)
