import { dateTimeArrayToIsoDuration } from "@/helpers/date"
import { isoDurationToDateTimeArray } from "@/helpers/date"

describe("dateTimeArrayToIsoDuration", () => {
  it("serializes full 7-part array correctly", () => {
    expect(dateTimeArrayToIsoDuration([1, 2, 3, 4, 5, 6, 700])).toBe(
      "P1Y2M3DT4H5M6.700S",
    )
  })

  it("serializes missing time section correctly (no T)", () => {
    expect(
      dateTimeArrayToIsoDuration([
        1,
        2,
        3,
        undefined,
        undefined,
        undefined,
        undefined,
      ]),
    ).toBe("P1Y2M3D")
  })

  it("serializes defined 0 values correctly in date part", () => {
    expect(
      dateTimeArrayToIsoDuration([
        0,
        0,
        2,
        undefined,
        undefined,
        undefined,
        undefined,
      ]),
    ).toBe("P0Y0M2D")
  })

  it("serializes defined 0 values correctly in time part", () => {
    expect(
      dateTimeArrayToIsoDuration([
        undefined,
        undefined,
        2,
        0,
        undefined,
        undefined,
        undefined,
      ]),
    ).toBe("P2DT0H")
  })

  it("serializes only milliseconds correctly", () => {
    expect(
      dateTimeArrayToIsoDuration([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        250,
      ]),
    ).toBe("PT.250S")
  })

  it("serializes only seconds correctly", () => {
    expect(
      dateTimeArrayToIsoDuration([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        12,
        undefined,
      ]),
    ).toBe("PT12S")
  })

  it("serializes seconds and milliseconds correctly", () => {
    expect(
      dateTimeArrayToIsoDuration([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        12,
        250,
      ]),
    ).toBe("PT12.250S")
  })

  it("serializes multiple defined time parts correctly", () => {
    expect(
      dateTimeArrayToIsoDuration([
        undefined,
        undefined,
        undefined,
        2,
        45,
        0,
        0,
      ]),
    ).toBe("PT2H45M0.000S")
  })

  it("serializes only minutes correctly", () => {
    expect(
      dateTimeArrayToIsoDuration([
        undefined,
        undefined,
        undefined,
        undefined,
        5,
        undefined,
        undefined,
      ]),
    ).toBe("PT5M")
  })

  it("serializes fully zero-filled array correctly", () => {
    expect(dateTimeArrayToIsoDuration([0, 0, 0, 0, 0, 0, 0])).toBe(
      "P0Y0M0DT0H0M0.000S",
    )
  })

  it("serializes no parts (empty array) as P", () => {
    expect(dateTimeArrayToIsoDuration([])).toBe("P")
  })
})

describe("isoDurationToDateTimeArray", () => {
  it("parses full 7-part ISO string correctly", () => {
    expect(isoDurationToDateTimeArray("P1Y2M3DT4H5M6.700S")).toEqual([
      1, 2, 3, 4, 5, 6, 700,
    ])
  })

  it("parses missing time section correctly (no T)", () => {
    expect(isoDurationToDateTimeArray("P1Y2M3D")).toEqual([1, 2, 3])
  })

  it("parses defined 0 values in date part correctly", () => {
    expect(isoDurationToDateTimeArray("P0Y0M2D")).toEqual([0, 0, 2])
  })

  it("parses defined 0 values in time part correctly", () => {
    expect(isoDurationToDateTimeArray("P2DT0H")).toEqual([
      undefined,
      undefined,
      2,
      0,
    ])
  })

  it("parses only milliseconds correctly", () => {
    expect(isoDurationToDateTimeArray("PT.250S")).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      250,
    ])
  })

  it("parses only seconds correctly", () => {
    expect(isoDurationToDateTimeArray("PT12S")).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      12,
    ])
  })

  it("parses seconds and milliseconds correctly", () => {
    expect(isoDurationToDateTimeArray("PT12.250S")).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      12,
      250,
    ])
  })

  it("parses multiple defined time parts correctly", () => {
    expect(isoDurationToDateTimeArray("PT2H45M0.000S")).toEqual([
      undefined,
      undefined,
      undefined,
      2,
      45,
      0,
      0,
    ])
  })

  it("parses only minutes correctly", () => {
    expect(isoDurationToDateTimeArray("PT5M")).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      5,
    ])
  })

  it("parses fully zero-filled ISO string correctly", () => {
    expect(isoDurationToDateTimeArray("P0Y0M0DT0H0M0.000S")).toEqual([
      0, 0, 0, 0, 0, 0, 0,
    ])
  })

  it("parses empty duration (just 'P') correctly", () => {
    expect(isoDurationToDateTimeArray("P")).toEqual([])
  })
})

describe("Duration Roundtrip Tests", () => {
  const roundtripCases: [
    string,
    ReturnType<typeof isoDurationToDateTimeArray>,
  ][] = [
    ["P1Y2M3DT4H5M6.789S", [1, 2, 3, 4, 5, 6, 789]],
    ["P0Y0M2D", [0, 0, 2]],
    ["P2DT0H", [undefined, undefined, 2, 0]],
    [
      "PT12.250S",
      [undefined, undefined, undefined, undefined, undefined, 12, 250],
    ],
    [
      "PT.345S",
      [undefined, undefined, undefined, undefined, undefined, undefined, 345],
    ],
    ["PT5M", [undefined, undefined, undefined, undefined, 5]],
    ["P0Y0M0DT0H0M0.000S", [0, 0, 0, 0, 0, 0, 0]],
    ["P", []],
  ]

  it("round-trips text ➔ array ➔ text correctly", () => {
    for (const [text] of roundtripCases) {
      const parsed = isoDurationToDateTimeArray(text)
      const serialized = dateTimeArrayToIsoDuration(parsed)
      expect(serialized).toBe(text)
    }
  })

  it("round-trips array ➔ text ➔ array correctly", () => {
    for (const [, array] of roundtripCases) {
      const serialized = dateTimeArrayToIsoDuration(array)
      const parsed = isoDurationToDateTimeArray(serialized)
      expect(parsed).toEqual(array)
    }
  })
})
