import { DateTimeParts } from "@/app/types"
import DatePartsPicker from "@/components/DatePartsPicker"
import { ConfigInputProps } from "@/fieldRegistry/types"

export default function DurationFieldConfigInput({
  config,
  onConfigChange,
}: ConfigInputProps<"duration">) {
  const parts = config.parts ?? [true, true, true, true, true, true, false]

  return (
    <DatePartsPicker
      parts={parts}
      onPartsChange={updated =>
        onConfigChange({ parts: updated as DateTimeParts })
      }
    />
  )
}
