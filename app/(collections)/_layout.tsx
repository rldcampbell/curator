import { Stack } from "expo-router"

export default function CollectionsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Collections" }} />
      <Stack.Screen name="[cId]" options={{ title: "Collection Details" }} />
      <Stack.Screen
        name="[cId]/items/[iId]"
        options={{ title: "Item Details" }} // Q - do we need to define here? Can it be dynamic?
      />
    </Stack>
  )
}
