import { View, Text, Button } from "react-native"
import { router } from "expo-router"

export default function CollectionsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Collections</Text>
      <Button
        title="Go to Collection 1"
        onPress={
          () => router.push("/(collections)/1" as any) /* to fix properly! */
        }
      />
      <Button
        title="Go to Collection 2"
        onPress={
          () => router.push("/(collections)/2" as any) /* to fix properly! */
        }
      />
    </View>
  )
}
