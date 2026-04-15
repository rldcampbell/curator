import { StyleSheet, View } from "react-native"

import AppText from "@/components/AppText"
import { HexColor, getPaleColor } from "@/helpers/color"

type Props = {
  count: number
  singularLabel: string
  pluralLabel?: string
  accentColor: HexColor
}

export default function CountBadge({
  count,
  singularLabel,
  pluralLabel,
  accentColor,
}: Props) {
  const label = count === 1 ? singularLabel : (pluralLabel ?? `${singularLabel}s`)

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getPaleColor(accentColor, 0.14),
          borderColor: getPaleColor(accentColor, 0.28),
        },
      ]}
    >
      <AppText weight="medium" style={[styles.text, { color: accentColor }]}>
        {count} {label}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
  },
})
