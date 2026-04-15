import { Collection } from "@/types"
import { patchCollection } from "@/helpers/meta"

describe("patchCollection", () => {
  const baseTimestamp = 1700000000000

  const existing: Collection = {
    name: "My Collection",
    color: "#ff0000",
    fieldOrder: ["f-1-1-1-1", "f-2-2-2-2"],
    fields: {
      "f-1-1-1-1": {
        name: "Field 1",
        type: "text",
        config: {},
        _meta: { createdAt: baseTimestamp, updatedAt: baseTimestamp },
      },
      "f-2-2-2-2": {
        name: "Field 2",
        type: "number",
        config: {},
        _meta: { createdAt: baseTimestamp, updatedAt: baseTimestamp },
      },
    },
    itemOrder: ["i-1-1-1-1"],
    items: {
      "i-1-1-1-1": {
        tags: [],
        values: {
          "f-1-1-1-1": "Hello",
          "f-2-2-2-2": 42,
        },
        _meta: { createdAt: baseTimestamp, updatedAt: baseTimestamp },
      },
    },
    _meta: { createdAt: baseTimestamp, updatedAt: baseTimestamp },
  }

  it("updates name and color and updates updatedAt", () => {
    const updated = patchCollection(
      existing,
      {
        name: "New Name",
        color: "#00ff00",
      },
      { timestamp: baseTimestamp + 1000 },
    )

    expect(updated).not.toBeNull()
    expect(updated?.name).toBe("New Name")
    expect(updated?.color).toBe("#00ff00")
    expect(updated?._meta.updatedAt).toBe(baseTimestamp + 1000)
  })

  it("preserves unchanged field metadata on collection-only updates", () => {
    const updated = patchCollection(
      existing,
      {
        name: "Renamed Collection",
        color: existing.color,
        fieldOrder: existing.fieldOrder,
        fields: {
          "f-1-1-1-1": { name: "Field 1", type: "text", config: {} },
          "f-2-2-2-2": { name: "Field 2", type: "number", config: {} },
        },
      },
      { timestamp: baseTimestamp + 1500 },
    )

    expect(updated).not.toBeNull()
    expect(updated?.fields["f-1-1-1-1"]).toBe(existing.fields["f-1-1-1-1"])
    expect(updated?.fields["f-2-2-2-2"]).toBe(existing.fields["f-2-2-2-2"])
    expect(updated?.fields["f-1-1-1-1"]._meta.updatedAt).toBe(baseTimestamp)
    expect(updated?.fields["f-2-2-2-2"]._meta.updatedAt).toBe(baseTimestamp)
    expect(updated?._meta.updatedAt).toBe(baseTimestamp + 1500)
  })

  it("only touches metadata for fields that actually changed", () => {
    const updated = patchCollection(
      existing,
      {
        fields: {
          "f-1-1-1-1": { name: "Field 1", type: "text", config: {} },
          "f-2-2-2-2": {
            name: "Field 2 Renamed",
            type: "number",
            config: {},
          },
        },
      },
      { timestamp: baseTimestamp + 1750 },
    )

    expect(updated).not.toBeNull()
    expect(updated?.fields["f-1-1-1-1"]).toBe(existing.fields["f-1-1-1-1"])
    expect(updated?.fields["f-1-1-1-1"]._meta.updatedAt).toBe(baseTimestamp)
    expect(updated?.fields["f-2-2-2-2"].name).toBe("Field 2 Renamed")
    expect(updated?.fields["f-2-2-2-2"]._meta.createdAt).toBe(baseTimestamp)
    expect(updated?.fields["f-2-2-2-2"]._meta.updatedAt).toBe(
      baseTimestamp + 1750,
    )
  })

  it("removes deleted fields", () => {
    const updated = patchCollection(
      existing,
      {
        fields: {
          "f-1-1-1-1": { name: "Field 1 Updated", type: "text", config: {} },
        },
        fieldOrder: ["f-1-1-1-1"],
      },
      { timestamp: baseTimestamp + 2000 },
    )

    expect(updated).not.toBeNull()
    expect(updated?.fields["f-1-1-1-1"].name).toBe("Field 1 Updated")
    expect(updated?.fields["f-2-2-2-2"]).toBeUndefined()
    expect(updated?.itemOrder).toEqual(["i-1-1-1-1"])
    expect(updated?.items["i-1-1-1-1"].values).toEqual({
      "f-1-1-1-1": "Hello",
      "f-2-2-2-2": 42, // even though f-2-2-2-2 removed we don't care here - won't be displayed
    })
  })

  it("returns null if nothing changed", () => {
    const updated = patchCollection(
      existing,
      {},
      { timestamp: baseTimestamp + 3000 },
    )
    expect(updated).toBeNull()
  })
})
