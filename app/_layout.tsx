import { ActivityIndicator, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import "react-native-get-random-values"

import { useFonts } from "expo-font"
import { Tabs } from "expo-router"

import { Ionicons } from "@expo/vector-icons"

import AppText from "@/components/AppText"
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
        <AppText style={[sharedStyles.errorText, { textAlign: "center" }]}>
          {error.message}
        </AppText>
      </View>
    )
  }

  return <>{children}</>
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins/Poppins-Black.ttf"),
    "Poppins-BlackItalic": require("../assets/fonts/Poppins/Poppins-BlackItalic.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    "Poppins-BoldItalic": require("../assets/fonts/Poppins/Poppins-BoldItalic.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraBoldItalic": require("../assets/fonts/Poppins/Poppins-ExtraBoldItalic.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins/Poppins-ExtraLight.ttf"),
    "Poppins-ExtraLightItalic": require("../assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins/Poppins-Light.ttf"),
    "Poppins-LightItalic": require("../assets/fonts/Poppins/Poppins-LightItalic.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins/Poppins-Medium.ttf"),
    "Poppins-MediumItalic": require("../assets/fonts/Poppins/Poppins-MediumItalic.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-RegularItalic": require("../assets/fonts/Poppins/Poppins-Italic.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-SemiBoldItalic": require("../assets/fonts/Poppins/Poppins-SemiBoldItalic.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins/Poppins-Thin.ttf"),
    "Poppins-ThinItalic": require("../assets/fonts/Poppins/Poppins-ThinItalic.ttf"),
  })

  if (!fontsLoaded) {
    return null
  }
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
            <Tabs.Screen
              name="dev"
              options={{
                title: "Dev",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="bug-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="test"
              options={{
                title: "Test",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="flask" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
        </CollectionsProviderWrapper>
      </CollectionsProvider>
    </GestureHandlerRootView>
  )
}
