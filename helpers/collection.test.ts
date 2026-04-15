import { changeSummary } from "@/helpers/collection"
import { CollectionInput } from "@/context/CollectionsContext"

const baseCollection: CollectionInput = {
  name: "Films",
  color: "#ff0000",
  fieldOrder: ["f-AAAA-BBBB-CCCC-DDDD"],
  fields: {
    "f-AAAA-BBBB-CCCC-DDDD": {
      name: "Watched At",
      type: "datetime",
      config: {
        parts: [true, true, true, true, true, false, false],
      },
    },
  },
}

describe("changeSummary", () => {
  it("flags config-only field edits as changes", () => {
    const edited: CollectionInput = {
      ...baseCollection,
      fields: {
        "f-AAAA-BBBB-CCCC-DDDD": {
          ...baseCollection.fields["f-AAAA-BBBB-CCCC-DDDD"],
          config: {
            parts: [true, true, true, true, true, true, false],
          },
        },
      },
    }

    expect(changeSummary(baseCollection, edited)).toEqual({
      name: false,
      fields: true,
      fieldOrder: false,
      color: false,
      any: true,
    })
  })
})
