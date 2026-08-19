import "@/global.css";

import { useFonts } from "expo-font";
import { ActivityIndicator, Text, View } from "react-native";

import { RootNavigator } from "@/navigation/RootNavigator";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require("../node_modules/@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf"),
    Poppins_600SemiBold: require("../node_modules/@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf"),
    Poppins_700Bold: require("../node_modules/@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color="#059669" />
        <Text className="mt-4 text-sm font-semibold text-slate-600">Memuat aset aplikasi...</Text>
      </View>
    );
  }

  return <RootNavigator />;
}
