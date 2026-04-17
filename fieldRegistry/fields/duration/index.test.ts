import { FieldType, RawField } from "@/types"

import { duration } from "./index"

const hourMinuteField: Extract<RawField, { type: typeof FieldType.Duration }> = {
  name: "Runtime",
  type: FieldType.Duration,
  config: {
    topUnit: "hour",
    bottomUnit: "minute",
  },
}

const monthField: Extract<RawField, { type: typeof FieldType.Duration }> = {
  name: "Months",
  type: FieldType.Duration,
  config: {
    topUnit: "month",
    bottomUnit: "month",
  },
}

describe("duration field definition", () => {
  it("uses strict config-aware text conversion", () => {
    expect(duration.toText(hourMinuteField, [1, 0])).toBe("1H0M")
    expect(duration.fromText(hourMinuteField, "1H0M")).toEqual([1, 0])
    expect(duration.fromText(monthField, "2M")).toEqual([2])
  })

  it("rejects values and text that do not match the configured shape", () => {
    expect(duration.validate(hourMinuteField, [1, 75])).toBe(false)
    expect(duration.fromText(hourMinuteField, "01H0M")).toBeUndefined()
    expect(duration.fromText(hourMinuteField, "1H")).toBeUndefined()
  })
})
