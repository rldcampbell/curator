import { DateTimeParts } from "@/app/types"
import DatePartsPicker from "@/components/DatePartsPicker"
import { ConfigInputProps } from "@/fieldRegistry/types"

export default function DateTimeFieldConfigInput({
  config,
  onConfigChange,
}: ConfigInputProps<"datetime">) {
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
