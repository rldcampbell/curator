# ADR 002: Duration Field Semantics

Status: Accepted
Date: 2026-04-17

## Context

Curator needs a `duration` field type that supports more than one fixed duration shape.
It must support fixed, user-defined, contiguous ranges of duration units such as:

- `year..day`
- `month..day`
- `hour..minute`
- `second..ms`

The existing implementation is not a good long-term fit for this:

- field config uses a loose boolean `parts` array
- stored values use sparse 7-slot arrays with empty positions
- text conversion is not aligned with the intended long-term format
- component-preserving duration semantics are not locked
- query behavior is undefined for the shapes Curator wants to support

Query/filter work is a core next phase, so `duration` semantics need to be locked before implementation continues.

## Decision

### 1. Core Meaning

`duration` is a fixed-shape, component-preserving value.

This means:

- each field defines one fixed shape
- all items in that field use that same shape
- values preserve the units the user entered, rather than being normalized to one scalar length
- ambiguous calculations or comparisons are out of scope

Examples:

- `1H30M` is not canonically the same thing as `90M`
- `1M` is not reduced to a fixed number of days

If Curator later needs a normalized scalar duration type, that should be introduced as a separate field type rather than changing the meaning of this one.

### 2. Field Configuration

`duration` field config is an object:

```ts
{
  topUnit: DurationUnit
  bottomUnit: DurationUnit
}
```

Where unit order is:

```ts
type DurationUnit =
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
- `{ topUnit: "second", bottomUnit: "ms" }`

Non-contiguous shapes are not allowed.

### 3. Canonical Value Shape

Canonical `duration` values are dense ordered arrays of active components only.

Examples:

- `year..day` -> `[3, 2, 10]`
- `month..day` -> `[100, 20]`
- `hour..minute` -> `[1, 30]`
- `ms..ms` -> `[250]`

This dense array is the canonical value shape:

- in memory
- in persisted JSON inside the local DB
- in query values

Curator will not retain the current sparse 7-slot tuple with unused positions as the long-term canonical model.

### 4. Storage

Canonical storage for `duration` values is the dense ordered component array, JSON-encoded in the existing item value storage layer.

Curator will not store user `duration` values canonically as:

- normalized total milliseconds
- normalized total seconds
- JS `Date` objects

Derived compare or index keys may be added later if useful, but they are not the source of truth.

### 5. Validation

All `duration` components are non-negative in v1.

The top unit is uncapped for practical purposes.
Lower units use natural caps:

- `month`: `0..11` when not the top unit
- `day`: `0..31` when not the top unit
- `hour`: `0..23` when not the top unit
- `minute`: `0..59` when not the top unit
- `second`: `0..59` when not the top unit
- `ms`: `0..999` when not the top unit

Examples:

- `month..day`: `[100, 20]` is valid
- `day..day`: `[32]` is valid
- `hour..minute`: `[1, 75]` is invalid
- `month..day`: `[3, 32]` is invalid

Invalid lower-unit overflow is rejected rather than normalized.
For example, Curator will not silently convert:

- `1H75M` to `2H15M`
- `3M32D` to `4M1D`

Zero duration is valid.

### 6. Text Format

Canonical text format for `duration` is:

- compact
- field-config-aware
- ISO-like in structure
- unpadded for integer units
- strict

Formatting rules:

- use unit suffixes in canonical unit order
- omit the leading `P`
- use `T` when the configured range crosses from day to hour
- integer units are unpadded
- if `ms` is present, represent it via fractional seconds
- fractional seconds always use exactly 3 digits
- all active units are explicit, including zeroes

Examples:

- `year..year` -> `3Y`
- `year..day` -> `3Y2M10D`
- `month..month` -> `2M`
- `minute..minute` -> `2M`
- `hour..minute` -> `1H0M`
- `hour..second` -> `3H30M29S`
- `day..second` -> `10DT4H30M29S`
- `second..ms` -> `29.250S`
- `ms..ms` -> `0.250S`

If `ms` is present, the fractional part is always shown, including zero:

- `second..ms` -> `29.000S`
- `ms..ms` -> `0.000S`

Parsing/import in v1 accepts only the canonical strict format for the field shape.

Curator will not use:

- custom `MS` suffixes
- normalized scalar text forms
- placeholder-heavy self-describing strings

Because text is field-config-aware, strings such as `2M` are acceptable even though they mean different things for `month..month` and `minute..minute`.

### 7. Query Shape Rules

Whole-value query inputs must use the same shape as the field.

Examples:

- an `hour..minute` field is queried with `hour..minute` values
- a `day..day` field is queried with `day` values

Whole-value queries do not implicitly coerce or promote across shapes.

### 8. Initial Whole-Value Operators

The initial positive whole-value operator set for `duration` is:

- `is`
- `before`
- `after`
- `on or before`
- `on or after`
- `between`

Negation is not defined as a `duration`-specific operator family.
Generic rule or group negation belongs to the wider query system.

### 9. Initial Component Operators

The initial component operator family is equality-only:

- `{unit} is`

Examples:

- `hour is 1`
- `minute is 30`
- `month is 2`

Component operators are only available for units present in the field’s configured range.

Examples:

- `hour..minute` allows `hour is` and `minute is`
- `year..minute` allows `year is`, `month is`, `day is`, `hour is`, `minute is`
- `minute..second` does not allow `hour is` or `day is`

Component range operators are not part of this decision.

### 10. Comparison Semantics

Whole-value comparison operators use straight lexicographic ordering on the dense component array for that field shape.

Examples:

- `1H30M` is before `2H0M` for an `hour..minute` field
- `3D12H` is before `4D0H` for a `day..hour` field
- `2M10D` is before `3M0D` for a `month..day` field

These comparisons are component-preserving, not scalar-normalizing.

`before`, `after`, `on or before`, and `on or after` are non-wrapping.

### 11. Between Semantics

`between` is inclusive on both ends by default.

For `duration`, `between` is always non-wrapping:

- `start <= end` is valid
- `start > end` is invalid

Unlike yearless `datetime`, `duration` is not treated as cyclic or recurring.

### 12. Relationship to Scalar Duration

This ADR does not define `duration` as a normalized scalar elapsed-time type.

If Curator later needs semantics such as:

- `90M == 1H30M`
- normalized total-length comparison across shapes
- arithmetic and aggregation on scalarized values

that should be handled by a separate future field type or a separate future decision, rather than changing the meaning of this field type.

### 13. Migration Policy

At the current stage of development, no backward-compatible migration work is required for the old `duration` model.

Curator may wipe existing test data and move directly to the new model rather than preserving compatibility with:

- boolean `parts` config
- sparse 7-slot stored values

## Consequences

### Positive

- `duration` semantics become predictable and queryable
- natural-unit entry is preserved rather than hidden behind normalization
- any contiguous duration range can be represented
- storage stays compact and comparison-friendly
- text format stays close to ISO while remaining concise

### Negative

- text parsing must be aware of field config
- some text shapes are ambiguous outside schema context
- scalar-style calculations and equivalence are intentionally unsupported
- implementation will need a deliberate refactor of current duration config, validation, parsing, and storage helpers

### Deferred

These are explicitly not decided here:

- a future scalar/normalized duration field type
- cross-shape coercion or equivalence such as `90M == 1H30M`
- arithmetic or aggregation semantics for duration values
- component range operators such as `minute between`
- migration tooling for old local data
