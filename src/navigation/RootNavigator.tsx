import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { LoginScreen } from "@/screens/login/LoginScreen";
import { useAuthStore } from "@/stores/authStore";

import { MainTabs } from "./MainTabs";

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);
  const initialized = useAuthStore((state) => state.initialized);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  if (!initialized) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color="#059669" />
        <Text className="mt-4 text-sm font-semibold text-slate-600">Memuat sesi login...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
