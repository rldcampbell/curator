import DatePartsPicker from "@/components/DatePartsPicker"
import { ConfigInputProps } from "@/fieldRegistry/types"

export const ConfigInput = ({
  config,
  onConfigChange,
}: ConfigInputProps<"duration">) => {
  return (
    <DatePartsPicker
      config={config}
      onConfigChange={nextConfig => onConfigChange(nextConfig)}
    />
  )
}
