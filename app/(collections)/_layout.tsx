import { Stack } from "expo-router"

export default function CollectionsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Collections" }} />
      <Stack.Screen name="collections/[cId]" />
      <Stack.Screen
        name="collections/[cId]/items/[iId]"
        options={{ title: "Item Details" }}
      />
      <Stack.Screen
        name="configure/[cId]"
        options={{ title: "Edit Collection" }}
      />
      <Stack.Screen
        name="configure/index"
        options={{ title: "Add Collection" }}
      />
    </Stack>
  )
}
