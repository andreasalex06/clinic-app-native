import { Text, View } from "react-native";

export function PatientsScreen() {
  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <Text className="mb-2 text-3xl font-bold text-slate-950">Patients</Text>
      <Text className="text-base leading-6 text-slate-600">
        Data pasien, pencarian, dan detail riwayat kunjungan akan dibangun di sini.
      </Text>
    </View>
  );
}
