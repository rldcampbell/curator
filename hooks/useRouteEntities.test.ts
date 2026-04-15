import {
  resolveCollectionRoute,
  resolveItemRoute,
} from "@/helpers/routeEntities"
import { Collection, CollectionsData } from "@/types"

describe("resolveCollectionRoute", () => {
  const timestamp = 1700000000000

  const collection: Collection = {
    name: "Friends",
    color: "#00aa88",
    fieldOrder: ["f-AAAA-BBBB-CCCC-DDDD"],
    fields: {
      "f-AAAA-BBBB-CCCC-DDDD": {
        name: "Name",
        type: "text",
        config: {},
        _meta: { createdAt: timestamp, updatedAt: timestamp },
      },
    },
    itemOrder: ["i-AAAA-BBBB-CCCC-DDDD"],
    items: {
      "i-AAAA-BBBB-CCCC-DDDD": {
        tags: [],
        values: {
          "f-AAAA-BBBB-CCCC-DDDD": "Alice",
        },
        _meta: { createdAt: timestamp, updatedAt: timestamp },
      },
    },
    _meta: { createdAt: timestamp, updatedAt: timestamp },
  }

  const collections: CollectionsData["collections"] = {
    "c-AAAA-BBBB-CCCC-DDDD": collection,
  }

  it("returns null for invalid collection params", () => {
    expect(resolveCollectionRoute({}, collections)).toBeNull()
    expect(
      resolveCollectionRoute({ cId: ["c-AAAA-BBBB-CCCC-DDDD"] }, collections),
    ).toBeNull()
    expect(
      resolveCollectionRoute({ cId: "not-a-collection-id" }, collections),
    ).toBeNull()
  })

  it("returns the collection route for a valid existing collection", () => {
    expect(
      resolveCollectionRoute({ cId: "c-AAAA-BBBB-CCCC-DDDD" }, collections),
    ).toEqual({
      collectionId: "c-AAAA-BBBB-CCCC-DDDD",
      collection,
    })
  })
})

describe("resolveItemRoute", () => {
  const timestamp = 1700000000000

  const collection: Collection = {
    name: "Friends",
    color: "#00aa88",
    fieldOrder: ["f-AAAA-BBBB-CCCC-DDDD"],
    fields: {
      "f-AAAA-BBBB-CCCC-DDDD": {
        name: "Name",
        type: "text",
        config: {},
        _meta: { createdAt: timestamp, updatedAt: timestamp },
      },
    },
    itemOrder: ["i-AAAA-BBBB-CCCC-DDDD", "i-EEEE-FFFF-GGGG-HHHH"],
    items: {
      "i-AAAA-BBBB-CCCC-DDDD": {
        tags: [],
        values: {
          "f-AAAA-BBBB-CCCC-DDDD": "Alice",
        },
        _meta: { createdAt: timestamp, updatedAt: timestamp },
      },
      "i-EEEE-FFFF-GGGG-HHHH": {
        tags: [],
        values: {
          "f-AAAA-BBBB-CCCC-DDDD": "Bob",
        },
        _meta: { createdAt: timestamp, updatedAt: timestamp },
      },
    },
    _meta: { createdAt: timestamp, updatedAt: timestamp },
  }

  const collections: CollectionsData["collections"] = {
    "c-AAAA-BBBB-CCCC-DDDD": collection,
  }

  it("returns null for invalid or missing item routes", () => {
    expect(
      resolveItemRoute({ cId: "c-AAAA-BBBB-CCCC-DDDD" }, collections),
    ).toBeNull()
    expect(
      resolveItemRoute(
        {
          cId: "c-AAAA-BBBB-CCCC-DDDD",
          iId: ["i-AAAA-BBBB-CCCC-DDDD"],
        },
        collections,
      ),
    ).toBeNull()
    expect(
      resolveItemRoute(
        {
          cId: "c-AAAA-BBBB-CCCC-DDDD",
          iId: "i-ZZZZ-YYYY-XXXX-WWWW",
        },
        collections,
      ),
    ).toBeNull()
  })

  it("returns null when the item exists but is missing from itemOrder", () => {
    expect(
      resolveItemRoute(
        {
          cId: "c-AAAA-BBBB-CCCC-DDDD",
          iId: "i-EEEE-FFFF-GGGG-HHHH",
        },
        {
          "c-AAAA-BBBB-CCCC-DDDD": {
            ...collection,
            itemOrder: ["i-AAAA-BBBB-CCCC-DDDD"],
          },
        },
      ),
    ).toBeNull()
  })

  it("returns the item route for a valid existing item", () => {
    expect(
      resolveItemRoute(
        {
          cId: "c-AAAA-BBBB-CCCC-DDDD",
          iId: "i-EEEE-FFFF-GGGG-HHHH",
        },
        collections,
      ),
    ).toEqual({
      collectionId: "c-AAAA-BBBB-CCCC-DDDD",
      collection,
      itemId: "i-EEEE-FFFF-GGGG-HHHH",
      item: collection.items["i-EEEE-FFFF-GGGG-HHHH"],
      itemIndex: 1,
    })
  })
})
