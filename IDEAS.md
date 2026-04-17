- Use Poppins font?
- Make special meta properties e.g. to style cards (colour?)
  - Make it possible for meta properties to reference actual properties?!
  - Maybe these could be special fields with fixed ids that are either toggled on or off.
  - Add default values for a collection when defining a collection?
  - Allow standard properties to have default values too...
- Add a selectable-list field type:
  - dropdown / pick-list style input
  - allow new options to be created at entry time ("create on the fly")
  - likely useful for repeated categories like grape, region, producer etc.
  - needs thought about whether options live per field definition and how queries should treat them
- When in process of creating new collection allow navigation back out - but the screen will then show a collection that is not yet complete. You can go back in and finish it / discard it as required.

## Search / Queries

- Aim: a fast, phone-first query builder for collection items.
- Primary UX should be tap-driven blocks, not free-text syntax:
  - sentence-style rules: `[Field] [Operator] [Value]`
  - group rules with `Match all` / `Match any`
  - support `Exclude` / `NOT` groups
  - keep nesting shallow in v1
- Strongest inspiration:
  - Airtable for field-aware rule building
  - Notion for grouped `AND` / `OR`
  - Linear later for quick-add / autocomplete shortcuts
- Canonical model should still be a JSON query tree (`group` + `rule` nodes). The UI edits that tree directly.
- Query semantics should be a separate layer from `FieldType`:
  - field type = storage / input / display
  - query type class = allowed operators
- V1 should evaluate queries in memory against hydrated collections, not in SQL.
- Treat `tags`, `createdAt`, and `updatedAt` as pseudo-fields.
- Broad v1 operator classes:
  - text
  - number
  - boolean
  - temporal (`date` / `datetime`)
  - presence-only (`image`)
  - tags / meta
- Free-text query syntax is not the primary v1 UX. It may be added later as a convenience layer that compiles to the same JSON tree.
- Open semantic work to revisit separately:
  - `datetime` with configurable parts
  - `duration` ordering / range semantics
- Sensible order of work:
  1. Query type metadata beside the field registry
  2. In-memory evaluator + tests
  3. Minimal mobile block builder UI
  4. Saved queries / shortcut entry
  5. Storage indexing only if performance demands it
