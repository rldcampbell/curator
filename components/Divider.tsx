import { LinearGradient } from "expo-linear-gradient"
import { View, StyleSheet } from "react-native"

export default function Divider() {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["rgba(0,0,0,0.05)", "transparent"]}
        style={styles.gradient}
        pointerEvents="none"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 12,
    overflow: "hidden",
    marginBottom: 4,
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
})
