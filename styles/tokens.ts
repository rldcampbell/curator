export const colors = {
  surface: "#fff",
  screenMuted: "#f2f2f2",
  overlay: "rgba(0, 0, 0, 0.3)",
  borderSubtle: "#eee",
  borderMuted: "#ddd",
  borderInput: "#ccc",
  textBody: "#222",
  textLabel: "#333",
  textMuted: "#555",
  textTertiary: "#666",
  textPlaceholder: "#999",
  accent: "#007AFF",
  accentSoft: "#e0f7fa",
  warningSoft: "#fff8e1",
  rowActive: "#f0f0f0",
  destructive: "#FF3B30",
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 40,
  listFooter: 100,
} as const

export const radii = {
  sm: 12,
  md: 16,
  round: 20,
  pill: 999,
} as const

export const shadows = {
  card: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
} as const
