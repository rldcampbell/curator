import { DateArray } from "@/app/types"
import DateFieldInput from "@/components/fieldInputs/DateFieldInput"
import { DateDisplay } from "@/fieldRegistry/display/DateDisplay"
import { FieldDefinition } from "@/fieldRegistry/types"

const validate = (value: unknown): value is DateArray =>
  Array.isArray(value) &&
  value.length === 3 &&
  value.every(v => typeof v === "number")

export const date: FieldDefinition<"date"> = {
  label: "Date",
  defaultValue: [2024, 1, 1],
  defaultConfig: {},
  display: DateDisplay,
  input: DateFieldInput,
  validate,
  fromText: text => {
    if (!text) return undefined

    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return undefined

    const [, y, m, d] = match.map(Number)
    return [y, m, d] as [number, number, number]
  },
  toText: value =>
    value === undefined
      ? undefined
      : new Date(Date.UTC(value[0], value[1] - 1, value[2]))
          .toISOString()
          .slice(0, 10), // "YYYY-MM-DD"
}
