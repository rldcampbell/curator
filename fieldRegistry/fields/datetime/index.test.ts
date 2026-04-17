import { FieldType, RawField } from "@/types"

import { datetime } from "./index"

const monthDayField: Extract<RawField, { type: typeof FieldType.DateTime }> = {
  name: "Release Window",
  type: FieldType.DateTime,
  config: {
    topUnit: "month",
    bottomUnit: "day",
  },
}

describe("datetime field definition", () => {
  it("uses strict config-aware text conversion", () => {
    expect(datetime.toText(monthDayField, [5, 12])).toBe("05-12")
    expect(datetime.fromText(monthDayField, "05-12")).toEqual([5, 12])
  })

  it("rejects values and text that do not match the configured shape", () => {
    expect(datetime.validate(monthDayField, [2024, 5, 12])).toBe(false)
    expect(datetime.fromText(monthDayField, "2024-05-12")).toBeUndefined()
  })
})
