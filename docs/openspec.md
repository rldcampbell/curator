# OpenSpec

Status: Draft
Last updated: 2026-04-16

This document is the current product/spec source of direction for Curator.
`IDEAS.md` remains a rough scratchpad for notes and unshaped ideas.

## 1. Product Purpose

Curator is a phone-first personal database for anything you care about.
The user defines their own fields, captures entries with photos, and queries collections like real datasets.

The near-to-mid-term goal is not to build a collaborative workspace.
It is to build a serious personal curation tool that feels lightweight on a phone but is structurally powerful underneath.

## 2. Target User and Core Use Cases

Primary user:

- One person managing their own structured collections on their own device.

Representative collections:

- Wines I like.
- Books, films, music, or games worth revisiting.
- Coffee beans, roasters, brew setups, or tasting notes.
- Places, restaurants, walks, or travel references.
- Hobby inventories, collecting, gear, or reference libraries.

Core jobs:

- Define a schema quickly without needing a spreadsheet or custom app.
- Capture an item in the moment, often with a photo.
- Add enough structure that the collection becomes queryable later.
- Browse, filter, and answer personal questions from the data.
- Save useful recurring views once query support exists.
- Keep data local and still have a trustworthy backup/export path.

## 3. Product Positioning

Curator should feel like:

- A personal database, not just a note-taking app.
- A curation tool, not just a form builder.
- Mobile-first, not desktop software squeezed onto a phone.
- Flexible enough for many domains without losing structure.

Working product statement:

> A phone-first personal database for anything you care about: define your own fields, capture entries with photos, and query your collections like a real dataset.

## 4. Product Principles

- Personal-first, not team-first.
- Local-first and offline-first by default.
- User-defined structure is the product core.
- Querying and filtering are first-class features.
- Photos are first-class data, not decoration.
- Power should be progressive: quick to start, deeper over time.
- The generic model should stay grounded in real curation use cases.

## 5. Core UX Principles

- Make it easy to get a collection running with only a few fields.
- Separate schema editing from item entry, but allow fluid movement between them.
- Optimize for fast capture first, deep retrieval second.
- Avoid generic spreadsheet UX as the default interaction model.
- Use structured, tap-driven interfaces for advanced features where possible.
- Let the app feel useful with small collections and still coherent as collections grow.
- Prefer visible state and predictable flows over hidden power features.

## 6. Mobile-First Principles

- Design the primary flows for one-handed use.
- Favor large tap targets, simple stacks, and clear primary actions.
- Treat modal or sheet-based editing as normal, not secondary.
- Query building must be phone-first and tap-driven, not syntax-first.
- Keyboard-heavy interaction is acceptable for text entry, but not for advanced filtering.
- Photo capture and review should fit naturally into item entry.

## 7. Local-First / Offline-First Assumptions

- The device-local database is the source of truth for now.
- Core product value must not depend on connectivity.
- Collection CRUD, item CRUD, image attachment, browsing, filtering, and saved views must all work offline.
- There is no account, sync, or collaboration requirement in the current phase.
- Backup/export matters because local-only storage otherwise creates trust risk.
- Future sync, if added, should layer onto the local model rather than replace it.

## 8. Domain Model

### 8.1 Collections

A collection is a user-defined container with:

- A name.
- An optional color or visual identity.
- An ordered set of fields.
- An ordered set of items.
- Metadata such as `createdAt` and `updatedAt`.

Collections are the top-level organizing unit and should remain lightweight to create.

### 8.2 Items

An item is a record inside a collection with:

- Values keyed by field id.
- Optional tags.
- Metadata such as `createdAt` and `updatedAt`.

An item should behave like a row in a dataset, while still feeling natural to edit on a phone.

### 8.3 Fields

A field defines one property of a collection schema.
Each field has:

- A name.
- A type.
- Per-type config where needed.

Current supported field types:

- `text`
- `number`
- `boolean`
- `datetime`
- `duration`
- `image`

Directionally:

- `datetime` and `duration` stay supported.
- Their detailed semantics are defined in dedicated ADRs rather than repeated in the main product doc.
- A future selectable-list/dropdown field type is likely important.

### 8.4 Field Type Responsibilities

Field type concerns should stay separate from query concerns.

Field types are responsible for:

- Storage shape.
- Validation.
- Input UI.
- Display UI.
- Text conversion where relevant.

Query behavior should be defined by query/operator metadata layered beside the field system, not buried inside raw field storage definitions.

### 8.5 Photos and Images

Images are part of the core product value.
For many collections, especially examples like wine, a photo is often one of the most important pieces of data.

Product direction:

- Image capture should feel first-class during item entry.
- Collections should be able to meaningfully use photos, not just hide them inside detail views.
- Image-backed workflows should later support autofill or suggestion flows.

Current directional stance:

- In the short term, supporting one primary image per item well is more important than supporting many images poorly.
- The longer-term canonical image model is still an open design decision.

## 9. Query, Filter, and Saved View Direction

Querying is a core feature, not a nice-to-have.
The app should eventually let users treat their collection like a real dataset.

### 9.1 Query UX

The primary query builder should be phone-first and tap-driven.
The core interaction model should feel like:

- Pick a field.
- Pick an operator.
- Provide a value.
- Group rules with `Match all` / `Match any`.
- Support exclusion with `NOT` or equivalent group negation.

Free-text query syntax is not the primary v1 UX.
It may be added later as a convenience layer that compiles to the same canonical model.

### 9.2 Canonical Query Model

The canonical model should be a JSON query tree.
The UI should edit that tree directly.

Directional shape:

```ts
type QueryNode = QueryGroup | QueryRule

type QueryGroup = {
  kind: "group"
  op: "and" | "or"
  negate?: boolean
  children: QueryNode[]
}

type QueryRule = {
  kind: "rule"
  field: string
  operator: string
  value?: unknown
}
```

This shape is directional, not final.
Exact naming, typing, and normalization rules belong in a dedicated ADR.

### 9.3 Query Semantics

Query semantics should be organized by operator class rather than by raw field type alone.
Useful operator classes likely include:

- Text.
- Number.
- Boolean.
- Temporal.
- Presence-only.
- Tags/meta.

Pseudo-fields should likely be supported, especially:

- `tags`
- `createdAt`
- `updatedAt`

V1 query execution should happen in memory against hydrated collections, not in SQL.

### 9.4 Saved Filters / Saved Views

Saved filters or views are an important later feature and should become first-class persisted entities.

Baseline direction:

- A collection can have multiple saved views.
- A saved view stores at least a name and query tree.
- Sort or presentation settings may also belong to saved views later, but do not need to be fully specified yet.

Before saved views exist, temporary unsaved filtering is still valuable and should ship first.

## 10. Backups and Export

Import/export is not the core product differentiator.
Backup/export is still important because the data is local-only.

Near-term expectations:

- Users should be able to export collection data reliably.
- Users should be able to create a backup of their local data.

Directionally:

- CSV export is useful but incomplete.
- A fuller backup path should eventually cover structured data and image assets together.

## 11. Non-Goals for Now

- Multi-user collaboration.
- Accounts and cloud sync.
- Desktop-first information architecture.
- A broad import pipeline as a headline feature.
- Free-text query syntax as the primary query experience.
- Heavy analytics or BI-style dashboards.
- Fully automated AI entry as a core flow in the current phase.
- Cross-collection relational modeling as a current priority.

## 12. Phased Roadmap

### Phase 0: Product Foundation

- Finalize the core product/spec direction.
- Keep `IDEAS.md` as scratch notes and use this doc as the clearer source of direction.
- Align naming and concepts across code and docs before major feature work.

### Phase 1: Query Foundation

- Add query-domain types and query metadata beside the field registry.
- Define pseudo-fields such as tags and timestamps.
- Implement an in-memory query evaluator.
- Add focused tests for query semantics and edge cases.

This should be pure product/domain work first, with minimal UI dependency.

### Phase 2: First Mobile Filter UX

- Add temporary per-collection filtering.
- Build a tap-driven mobile query builder for shallow groups and simple rules.
- Show filtered result counts, empty states, and a clear way to remove filters.
- Keep the first UI intentionally constrained rather than prematurely general.

### Phase 3: Saved Views

- Add first-class saved views to the data model and database.
- Let users create, rename, apply, edit, and delete saved views within a collection.
- Establish a clean separation between temporary filters and persisted saved views.

### Phase 4: Image-Forward Capture and Browsing

- Improve collection and item surfaces so photos matter in normal browsing, not just in detail view.
- Improve item-entry ergonomics for image-heavy collections.
- Decide and implement the canonical image model more deliberately.

### Phase 5: Backup / Export Hardening

- Move backup/export out of dev-only affordances.
- Define the intended backup format for local-only data.
- Ensure backup/export handles image-backed collections in a trustworthy way.

### Phase 6: Field System Expansion

- Add a selectable-list/dropdown field type.
- Support create-on-the-fly options during item entry.
- Revisit default values, templates, and other schema ergonomics only after querying is on track.

### Phase 7: Image-Assisted Autofill

- Explore photo-based suggestion flows such as extracting likely values from a wine label.
- Keep AI-assisted entry confirm-first, not auto-commit.
- Treat this as an accelerator on top of the structured model, not a replacement for it.

## 13. ADR Candidates / Open Questions

These should be handled in dedicated ADR-style follow-up docs rather than over-decided here.

1. Query schema and operator taxonomy.
   What is the final query-tree shape, and how are operators typed and versioned?

2. Saved-view persistence model.
   Does a saved view store only a query tree, or also sort, visible fields, grouping, and presentation choices?

3. Canonical image model.
   Should image fields represent one primary image, multiple images, or a richer asset structure?

4. Backup/export format.
   What is the durable backup format for local-only structured data plus images?

5. Selectable-list field design.
   Where do options live, how are they created on the fly, and how do queries treat them?

## 14. What This Spec Implies for the Next Build Phase

The next major phase should begin with the query foundation, not the final query UI.

That means:

- Formal query-domain types.
- Query metadata layered beside field definitions.
- In-memory evaluation against loaded collections.
- Tests that lock down semantics before the mobile builder UI exists.

This is the smallest high-leverage chunk that moves Curator toward its intended USP without prematurely committing to heavy UI or storage changes.
