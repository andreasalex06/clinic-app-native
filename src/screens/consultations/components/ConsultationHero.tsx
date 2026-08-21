import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "react-native";

import { Visit } from "@/screens/visits/types";

import { consultationStyles } from "./styles";

export function ConsultationHero({ visit }: { visit: Visit }) {
  return (
    <View className="rounded-3xl bg-primary-600 p-5">
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1">
          <Text className="text-[20px] leading-7 text-white" style={consultationStyles.textBold}>
            {visit.patient.name}
          </Text>
          <Text className="mt-2 text-sm leading-6 text-primary-50" style={consultationStyles.textRegular}>
            Isi hasil pemeriksaan pasien. Setelah submit, invoice otomatis dibuat backend.
          </Text>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <FontAwesome color="#ecfdf5" name="clipboard" size={22} />
        </View>
      </View>
    </View>
  );
}
