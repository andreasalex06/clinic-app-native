import { Text, View } from "react-native";

export function VisitsScreen() {
  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <Text className="mb-2 text-3xl font-bold text-slate-950">Visits</Text>
      <Text className="text-base leading-6 text-slate-600">
        Pendaftaran kunjungan, antrean, dan status konsultasi akan dibangun di sini.
      </Text>
    </View>
  );
}
