import {
  getTemporalIndicesInRange,
  getTemporalUnitsInRange,
  temporalConfigToParts,
} from "@/helpers/temporal"

describe("temporal helpers", () => {
  it("returns the configured contiguous unit range", () => {
    expect(
      getTemporalUnitsInRange({
        topUnit: "month",
        bottomUnit: "minute",
      }),
    ).toEqual(["month", "day", "hour", "minute"])
  })

  it("returns the configured contiguous indices", () => {
    expect(
      getTemporalIndicesInRange({
        topUnit: "hour",
        bottomUnit: "second",
      }),
    ).toEqual([3, 4, 5])
  })

  it("converts a config range to parts flags", () => {
    expect(
      temporalConfigToParts({
        topUnit: "month",
        bottomUnit: "day",
      }),
    ).toEqual([false, true, true, false, false, false, false])
  })
})
