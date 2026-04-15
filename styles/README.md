# Styling

## Policy

- Keep styles local to the component or screen by default.
- Move styles into `styles/` only when they are reused across files or define app-wide primitives.
- Use shared modules for primitives:
  - `tokens.ts`: raw values such as colors, spacing, radii, shadows
  - `layoutStyles.ts`: structural helpers
  - `screenStyles.ts`: app screen canvases
  - `surfaceStyles.ts`: reusable surfaces such as cards and inputs
  - `formStyles.ts`: reusable form-control styling
  - `stateStyles.ts`: cross-cutting UI states
  - `modalStyles.ts`: modal-specific styling
- Avoid static inline style objects. Keep inline styles only when values are truly dynamic at render time.

## Default rule

If a style is only used by one component and does not describe a reusable primitive, it should stay in that component file via `StyleSheet.create`.
