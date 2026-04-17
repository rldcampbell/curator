import {
  formatDateTimeValue,
  formatDurationValue,
  getDefaultDurationValue,
  getDurationUnitBounds,
  getTemporalIndicesInRange,
  getTemporalUnitsInRange,
  parseDateTimeValue,
  parseDurationValue,
  temporalConfigToParts,
  validateDateTimeValue,
  validateDurationValue,
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

describe("datetime temporal helpers", () => {
  it("formats dense values using the field-config-aware canonical text form", () => {
    expect(
      formatDateTimeValue(
        {
          topUnit: "month",
          bottomUnit: "minute",
        },
        [5, 12, 14, 30],
      ),
    ).toBe("05-12T14:30")

    expect(
      formatDateTimeValue(
        {
          topUnit: "second",
          bottomUnit: "ms",
        },
        [45, 123],
      ),
    ).toBe("45.123")
  })

  it("parses strict canonical text for the configured shape", () => {
    expect(
      parseDateTimeValue(
        {
          topUnit: "year",
          bottomUnit: "day",
        },
        "2024-05-12",
      ),
    ).toEqual([2024, 5, 12])

    expect(
      parseDateTimeValue(
        {
          topUnit: "day",
          bottomUnit: "hour",
        },
        "12T14",
      ),
    ).toEqual([12, 14])
  })

  it("rejects non-canonical or invalid datetime text", () => {
    expect(
      parseDateTimeValue(
        {
          topUnit: "month",
          bottomUnit: "day",
        },
        "5-12",
      ),
    ).toBeUndefined()

    expect(
      parseDateTimeValue(
        {
          topUnit: "year",
          bottomUnit: "day",
        },
        "2024-05-12T00:00",
      ),
    ).toBeUndefined()

    expect(
      parseDateTimeValue(
        {
          topUnit: "year",
          bottomUnit: "day",
        },
        "2024-02-30",
      ),
    ).toBeUndefined()
  })

  it("validates contextual day ranges exactly as defined by the ADR", () => {
    expect(
      validateDateTimeValue(
        {
          topUnit: "month",
          bottomUnit: "day",
        },
        [2, 29],
      ),
    ).toBe(true)

    expect(
      validateDateTimeValue(
        {
          topUnit: "month",
          bottomUnit: "day",
        },
        [2, 30],
      ),
    ).toBe(false)

    expect(
      validateDateTimeValue(
        {
          topUnit: "year",
          bottomUnit: "day",
        },
        [2024, 2, 29],
      ),
    ).toBe(true)

    expect(
      validateDateTimeValue(
        {
          topUnit: "year",
          bottomUnit: "day",
        },
        [2023, 2, 29],
      ),
    ).toBe(false)

    expect(
      validateDateTimeValue(
        {
          topUnit: "day",
          bottomUnit: "second",
        },
        [31, 23, 59, 59],
      ),
    ).toBe(true)
  })

  it("rejects dense values whose shape does not match the field config", () => {
    expect(
      validateDateTimeValue(
        {
          topUnit: "month",
          bottomUnit: "day",
        },
        [2024, 5, 12],
      ),
    ).toBe(false)

    expect(
      validateDateTimeValue(
        {
          topUnit: "hour",
          bottomUnit: "minute",
        },
        [14],
      ),
    ).toBe(false)
  })
})

describe("duration temporal helpers", () => {
  it("formats dense values using the canonical duration text form", () => {
    expect(
      formatDurationValue(
        {
          topUnit: "year",
          bottomUnit: "day",
        },
        [3, 2, 10],
      ),
    ).toBe("3Y2M10D")

    expect(
      formatDurationValue(
        {
          topUnit: "day",
          bottomUnit: "second",
        },
        [10, 4, 30, 29],
      ),
    ).toBe("10DT4H30M29S")

    expect(
      formatDurationValue(
        {
          topUnit: "second",
          bottomUnit: "ms",
        },
        [29, 250],
      ),
    ).toBe("29.250S")

    expect(
      formatDurationValue(
        {
          topUnit: "ms",
          bottomUnit: "ms",
        },
        [1234],
      ),
    ).toBe("1.234S")
  })

  it("parses strict canonical duration text for the configured shape", () => {
    expect(
      parseDurationValue(
        {
          topUnit: "hour",
          bottomUnit: "minute",
        },
        "1H0M",
      ),
    ).toEqual([1, 0])

    expect(
      parseDurationValue(
        {
          topUnit: "second",
          bottomUnit: "ms",
        },
        "29.250S",
      ),
    ).toEqual([29, 250])

    expect(
      parseDurationValue(
        {
          topUnit: "ms",
          bottomUnit: "ms",
        },
        "1.234S",
      ),
    ).toEqual([1234])
  })

  it("rejects non-canonical or invalid duration text", () => {
    expect(
      parseDurationValue(
        {
          topUnit: "year",
          bottomUnit: "day",
        },
        "P3Y2M10D",
      ),
    ).toBeUndefined()

    expect(
      parseDurationValue(
        {
          topUnit: "hour",
          bottomUnit: "minute",
        },
        "01H0M",
      ),
    ).toBeUndefined()

    expect(
      parseDurationValue(
        {
          topUnit: "second",
          bottomUnit: "ms",
        },
        "29S",
      ),
    ).toBeUndefined()

    expect(
      parseDurationValue(
        {
          topUnit: "month",
          bottomUnit: "day",
        },
        "3M32D",
      ),
    ).toBeUndefined()
  })

  it("validates dense duration values using uncapped top units and capped lower units", () => {
    expect(
      validateDurationValue(
        {
          topUnit: "month",
          bottomUnit: "day",
        },
        [100, 20],
      ),
    ).toBe(true)

    expect(
      validateDurationValue(
        {
          topUnit: "day",
          bottomUnit: "day",
        },
        [32],
      ),
    ).toBe(true)

    expect(
      validateDurationValue(
        {
          topUnit: "hour",
          bottomUnit: "minute",
        },
        [1, 75],
      ),
    ).toBe(false)

    expect(
      validateDurationValue(
        {
          topUnit: "month",
          bottomUnit: "day",
        },
        [3, 32],
      ),
    ).toBe(false)

    expect(
      validateDurationValue(
        {
          topUnit: "ms",
          bottomUnit: "ms",
        },
        [1234],
      ),
    ).toBe(true)
  })

  it("provides zero defaults and natural picker bounds", () => {
    expect(
      getDefaultDurationValue({
        topUnit: "hour",
        bottomUnit: "second",
      }),
    ).toEqual([0, 0, 0])

    expect(
      getDurationUnitBounds(
        {
          topUnit: "hour",
          bottomUnit: "second",
        },
        "hour",
      ),
    ).toEqual({ min: 0 })

    expect(
      getDurationUnitBounds(
        {
          topUnit: "hour",
          bottomUnit: "second",
        },
        "minute",
      ),
    ).toEqual({ min: 0, max: 59 })
  })
})
