export type HexColor = `#${string}`

const COLLECTION_COLORS = [
  "#FF6B6B", // bright coral red
  "#FFB84D", // golden orange
  "#FFD93D", // sunny yellow
  "#6BCB77", // vibrant mint green
  "#4D96FF", // bright blue
  "#A66CFF", // lively lavender
  "#F473B9", // warm pink
  "#00C2A8", // turquoise green
  "#FFA36C", // peachy orange
  "#9D4EDD", // rich violet
  "#43AA8B", // forest teal
  "#FFC6FF", // soft candy pink
] as const satisfies HexColor[]

type CollectionColor = (typeof COLLECTION_COLORS)[number]

const hashStringToNumber = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getCollectionColor = (idOrName: string): CollectionColor => {
  const hash = hashStringToNumber(idOrName)
  return COLLECTION_COLORS[hash % COLLECTION_COLORS.length]
}

const getPaleColor = (hex: HexColor, alpha = 0.08): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const getCollectionColorScheme = (
  idOrName: string,
): {
  accent: HexColor
  background: string
} => {
  const accent = getCollectionColor(idOrName)
  const background = getPaleColor(accent)
  return { accent, background }
}
