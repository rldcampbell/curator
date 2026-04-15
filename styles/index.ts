/**
 * Shared style policy
 *
 * - Keep styles local to a component or screen by default.
 * - Promote styles into `styles/` only when they are reused across files or
 *   represent app-wide primitives such as layout, surfaces, forms, state, or tokens.
 * - Avoid static inline style objects; keep inline styles only for genuinely dynamic values.
 */
export { collectionDetailStyles } from "./collectionDetailStyles"
export { formStyles } from "./formStyles"
export { sharedFieldStyles } from "./fieldStyles"
export { layoutStyles } from "./layoutStyles"
export { modalStyles } from "./modalStyles"
export { screenStyles } from "./screenStyles"
export { stateStyles } from "./stateStyles"
export { surfaceStyles } from "./surfaceStyles"
export { colors, radii, shadows, spacing } from "./tokens"
