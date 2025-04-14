export type HexColor = `#${string}`

const COLLECTION_COLORS: HexColor[] = [
  "#E27D60", // muted red / coral
  "#85DCB0", // mint green
  "#E8A87C", // soft orange / peach
  "#C38D9E", // dusty rose / mauve
  "#41B3A3", // teal / turquoise
  "#8DA7BE", // steel blue / soft denim
  "#F6C667", // warm yellow / sunflower
  "#999AC6", // lavender / muted purple
]

const hashStringToNumber = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getCollectionColor = (idOrName: string): HexColor => {
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
