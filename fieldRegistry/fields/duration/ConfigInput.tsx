import DatePartsPicker from "@/components/DatePartsPicker"
import { ConfigInputProps } from "@/fieldRegistry/types"

export const ConfigInput = ({
  config,
  onConfigChange,
}: ConfigInputProps<"duration">) => {
  const parts = config.parts ?? [true, true, true, true, true, true, false]

  return (
    <DatePartsPicker
      parts={parts}
      onPartsChange={parts => onConfigChange({ parts })}
    />
  )
}
