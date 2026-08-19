import { Pressable, Text, View } from "react-native";

import { useAuthStore } from "@/stores/authStore";

export function AccountScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <Text className="mb-2 text-3xl font-bold text-slate-950">Account</Text>
      <Text className="mb-6 text-base leading-6 text-slate-600">
        {user ? `${user.name} - ${user.role}` : "Sesi pengguna belum tersedia."}
      </Text>

      <View className="rounded-2xl border border-slate-200 bg-white p-5">
        <Text className="mb-1 text-sm font-semibold text-slate-500">Email</Text>
        <Text className="mb-5 text-lg font-bold text-slate-950">{user?.email ?? "-"}</Text>

        <Pressable
          className="min-h-12 items-center justify-center rounded-xl bg-slate-100 px-4 active:opacity-80"
          onPress={logout}
        >
          <Text className="text-base font-bold text-slate-700">Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}
