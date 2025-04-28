import { ReactNode } from "react"
import { StyleProp, TextProps, TextStyle } from "react-native"
import { Text } from "react-native"

type Font = "Poppins"

const weightMap = {
  black: "Black",
  bold: "Bold",
  extraBold: "ExtraBold",
  extraLight: "ExtraLight",
  light: "Light",
  medium: "Medium",
  regular: "Regular",
  semiBold: "SemiBold",
  thin: "Thin",
} as const

type Weight = keyof typeof weightMap
type MappedWeight = (typeof weightMap)[Weight]

type Italic = "Italic"
type FontAndWeight = `${Font}-${MappedWeight}`
type FontFamily = FontAndWeight | `${FontAndWeight}${Italic}`

const getFontFamily = ({
  font = "Poppins",
  weight = "regular",
  italic = false,
}: {
  font?: Font
  weight?: Weight
  italic?: boolean
}): FontFamily => `${font}-${weightMap[weight]}${italic ? "Italic" : ""}`

export type AppTextProps = TextProps & {
  children: ReactNode
  weight?: Weight
  italic?: boolean
  style?: StyleProp<TextStyle>
}

export default function AppText({
  children,
  weight = "regular",
  italic = false,
  style,
  ...rest
}: AppTextProps) {
  devStyleWarning(style)

  const fontFamily = getFontFamily({ weight, italic })

  return (
    <Text style={[{ fontFamily }, style]} {...rest}>
      {children}
    </Text>
  )
}

const devStyleWarning = (() => {
  const warnedStyles = new Set<string>()

  return (style: StyleProp<TextStyle>) => {
    if (__DEV__ && style) {
      const flatStyles = Array.isArray(style) ? style.flat() : [style]

      flatStyles.forEach(s => {
        if (s && typeof s === "object") {
          const { fontFamily, fontWeight } = s as TextStyle
          const key = JSON.stringify(s)

          if ((fontFamily || fontWeight) && !warnedStyles.has(key)) {
            warnedStyles.add(key)

            console.warn(
              "[AppText] Avoid passing 'fontFamily' or 'fontWeight' directly. Use 'weight' and 'italic' props instead.",
              JSON.stringify(s, null, 2),
            )
          }
        }
      })
    }
  }
})()
