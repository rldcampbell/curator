import { Stack } from "expo-router"

export default function CollectionsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Collections" }} />
      <Stack.Screen name="[cId]" />
      <Stack.Screen
        name="[cId]/items/[iId]"
        options={{ title: "Item Details" }}
      />
    </Stack>
  )
}
