# ADR 001: Datetime Field Semantics

Status: Accepted
Date: 2026-04-17

## Context

Curator needs a `datetime` field type that supports more than full dates or full timestamps.
It must support fixed, user-defined, contiguous ranges of temporal units such as:

- `year..day`
- `month..day`
- `hour..minute`
- `day..second`

The existing implementation is not a good long-term fit for this:

- field config uses a loose boolean `parts` array
- stored values use sparse 7-slot arrays with empty positions
- text conversion goes through JS `Date` / ISO timestamp behavior
- partial values do not round-trip cleanly
- user values risk inheriting timezone semantics that are not intended

Query/filter work is a core next phase, so `datetime` semantics need to be locked before implementation continues.

## Decision

### 1. Core Meaning

`datetime` is a fixed-shape local civil value.

This means:

- each field defines one fixed shape
- all items in that field use that same shape
- values represent local calendar/time components, not absolute instants
- changing device timezone must not change the interpreted stored value

User `datetime` values do not carry timezone semantics.
If true machine timestamps are needed, they should be handled separately, for example via metadata fields such as `createdAt` and `updatedAt`.

### 2. Field Configuration

`datetime` field config is an object:

```ts
{
  topUnit: DateTimeUnit
  bottomUnit: DateTimeUnit
}
```

Where unit order is:

```ts
type DateTimeUnit =
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "ms"
```

Any contiguous range is allowed.

Examples:

- `{ topUnit: "year", bottomUnit: "day" }`
- `{ topUnit: "month", bottomUnit: "day" }`
- `{ topUnit: "hour", bottomUnit: "minute" }`
- `{ topUnit: "day", bottomUnit: "second" }`

Non-contiguous shapes are not allowed.

### 3. Canonical Value Shape

Canonical `datetime` values are dense ordered arrays of active components only.

Examples:

- `year..day` -> `[2024, 5, 12]`
- `month..day` -> `[5, 12]`
- `hour..minute` -> `[14, 30]`
- `day..second` -> `[12, 14, 30, 45]`

This dense array is the canonical value shape:

- in memory
- in persisted JSON inside the local DB
- in query values

Curator will not retain the current sparse 7-slot tuple with unused positions as the long-term canonical model.

### 4. Storage

Canonical storage for `datetime` values is the dense ordered component array, JSON-encoded in the existing item value storage layer.

Curator will not store user `datetime` values canonically as:

- UTC timestamps
- JS `Date` objects
- timezone-bearing ISO instants

Derived compare or index keys may be added later if useful, but they are not the source of truth.

### 5. Validation

Unit ranges are:

- `year`: `0000..9999`
- `month`: `01..12`
- `day`: variable by context
- `hour`: `00..23`
- `minute`: `00..59`
- `second`: `00..59`
- `ms`: `000..999`

Day validation rules are:

- if `month` is absent, allow `day = 1..31`
- if `month` is present and `year` is absent, validate against the month, with February allowing `1..29`
- if both `month` and `year` are present, validate against the real calendar for that year

This means yearless values such as `02-29` are valid for shapes like `month..day`.

### 6. Text Format

Canonical text format for `datetime` is:

- compact
- local/civil
- field-config-aware
- ISO-like in delimiter style
- fixed-width
- strict

Formatting rules:

- `year` is always 4 digits
- `month`, `day`, `hour`, `minute`, `second` are always 2 digits
- `ms` is always 3 digits
- use `-` between date-side components
- use `:` between time-side components
- use `T` when the configured range crosses from day to hour
- use `.` before milliseconds
- do not include timezone markers

Examples:

- `year..year` -> `2024`
- `year..month` -> `2024-05`
- `month..day` -> `05-12`
- `hour..minute` -> `14:30`
- `month..minute` -> `05-12T14:30`
- `day..hour` -> `12T14`
- `second..ms` -> `45.123`

Parsing/import in v1 accepts only the canonical strict format for the field shape.

Curator will not use placeholder-heavy self-describing strings such as `####-05-12T14:30.###` as the canonical text format.
If self-description is needed, it should be provided by schema metadata rather than embedded placeholder syntax.

### 7. Query Shape Rules

Whole-value query inputs must use the same shape as the field.

Examples:

- a `month..day` field is queried with `month..day` values
- a `year..month` field is queried with `year..month` values

Whole-value queries do not implicitly coerce or promote across shapes.

### 8. Initial Whole-Value Operators

The initial positive whole-value operator set for `datetime` is:

- `is`
- `before`
- `after`
- `on or before`
- `on or after`
- `between`

Negation is not defined as a `datetime`-specific operator family.
Generic rule or group negation belongs to the wider query system.

### 9. Initial Component Operators

The initial component operator family is equality-only:

- `{unit} is`

Examples:

- `month is 05`
- `day is 12`
- `hour is 14`

Component operators are only available for units present in the field’s configured range.

Examples:

- `month..day` allows `month is` and `day is`
- `year..minute` allows `year is`, `month is`, `day is`, `hour is`, `minute is`
- `hour..minute` does not allow `day is` or `month is`

Component range operators are not part of this decision.

### 10. Comparison Semantics

Whole-value comparison operators use straight lexicographic ordering on the dense component array for that field shape.

Examples:

- `03-10` is after `02-28` for a `month..day` field
- `14:30` is after `09:15` for an `hour..minute` field

`before`, `after`, `on or before`, and `on or after` are non-wrapping.

### 11. Between Semantics

`between` is inclusive on both ends by default.

If the field includes a `year`, `between` is non-wrapping:

- `start <= end` is valid
- `start > end` is invalid

If the field does not include a `year`, `between` may wrap:

- if `start <= end`, evaluate normally
- if `start > end`, treat the range as cyclic

Examples:

- `month..day`: `12-15` to `01-15` wraps across year-end
- `hour..minute`: `23:00` to `01:00` wraps across midnight

The first UI may choose not to expose wrapping `between` cases, but the evaluator semantics should support them.

### 12. Relationship to `date`

The existing `date` field type is legacy.

Directionally, it should be removed and replaced by `datetime` using:

```ts
{ topUnit: "year", bottomUnit: "day" }
```

This ADR therefore treats `datetime` as the main temporal field family going forward.

### 13. Migration Policy

At the current stage of development, no backward-compatible migration work is required for the old `datetime` model.

Curator may wipe existing test data and move directly to the new model rather than preserving compatibility with:

- boolean `parts` config
- sparse 7-slot stored values

## Consequences

### Positive

- `datetime` semantics become predictable and queryable
- partial values round-trip cleanly
- user values are protected from accidental timezone drift
- any contiguous local civil range can be represented
- storage stays compact and comparison-friendly

### Negative

- text parsing must be aware of field config
- some text shapes are ambiguous outside schema context
- implementation will need a deliberate refactor of current datetime config, validation, parsing, and storage helpers

### Deferred

These are explicitly not decided here:

- duration semantics
- component range operators such as `month between`
- relative arithmetic operators such as `+- 1 day`
- migration tooling for old local data
- UI affordances for exposing or hiding wrapping `between` cases
