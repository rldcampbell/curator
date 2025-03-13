import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams(); // Get collection ID from URL

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Collection ID: {id}</Text>
    </View>
  );
}
