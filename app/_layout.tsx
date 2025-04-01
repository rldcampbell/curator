import { ActivityIndicator, Text, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import "react-native-get-random-values"

import { Tabs } from "expo-router"

import { Ionicons } from "@expo/vector-icons"

import {
  CollectionsProvider,
  useCollections,
} from "@/context/CollectionsContext"
import { sharedStyles } from "@/styles/sharedStyles"

function CollectionsProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, error } = useCollections()

  if (isLoading) {
    return (
      <View style={[sharedStyles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    )
  }

  if (error) {
    return (
      <View
        style={[
          sharedStyles.container,
          { justifyContent: "center", padding: 20 },
        ]}
      >
        <Text style={[sharedStyles.errorText, { textAlign: "center" }]}>
          {error.message}
        </Text>
      </View>
    )
  }

  return <>{children}</>
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CollectionsProvider>
        <CollectionsProviderWrapper>
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
        </CollectionsProviderWrapper>
      </CollectionsProvider>
    </GestureHandlerRootView>
  )
}
