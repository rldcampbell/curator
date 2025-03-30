import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import "react-native-get-random-values" // polyfill for crypto
import { CollectionsProvider } from "@/context/CollectionsContext"
export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CollectionsProvider>
        <Tabs>
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="(collections)"
            options={{
              title: "Collections",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="albums-outline" size={size} color={color} />
              ),
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </CollectionsProvider>
    </GestureHandlerRootView>
  )
}
