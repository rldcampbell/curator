import DatePartsPicker from "@/components/DatePartsPicker"
import { ConfigInputProps } from "@/fieldRegistry/types"

export const ConfigInput = ({
  config,
  onConfigChange,
}: ConfigInputProps<"datetime">) => {
  return (
    <DatePartsPicker
      config={config}
      onConfigChange={nextConfig => onConfigChange(nextConfig)}
    />
  )
}
