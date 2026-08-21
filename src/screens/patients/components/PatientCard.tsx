import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GENDER_LABEL, Patient } from "../types";

type PatientCardProps = {
  patient: Patient;
  onEdit: (patient: Patient) => void;
};

function formatBirthDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PatientCard({ patient, onEdit }: PatientCardProps) {
  return (
    <View className="rounded-3xl bg-primary-700 p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base leading-6 text-white" style={styles.textBold}>
            {patient.name}
          </Text>
          <Text className="mt-1 text-xs leading-5 text-primary-100" style={styles.textRegular}>
            {patient.phone}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable className="h-8 w-8 items-center justify-center rounded-full bg-white/15 active:opacity-80" onPress={() => onEdit(patient)}>
            <FontAwesome color="#ecfdf5" name="pencil" size={13} />
          </Pressable>
          <View className="rounded-full bg-primary-50 px-3 py-1">
            <Text className="text-[11px] text-primary-700" style={styles.textRegular}>
              {GENDER_LABEL[patient.gender]}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 gap-2 rounded-2xl bg-white/10 p-3">
        <View className="flex-row items-center gap-2">
          <FontAwesome color="#d1fae5" name="birthday-cake" size={13} />
          <Text className="text-xs leading-5 text-primary-50" style={styles.textRegular}>
            {formatBirthDate(patient.birthDate)}
          </Text>
        </View>
        <View className="flex-row items-start gap-2">
          <FontAwesome color="#d1fae5" name="map-marker" size={14} />
          <Text className="flex-1 text-xs leading-5 text-primary-50" style={styles.textRegular}>
            {patient.address}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textBold: {
    fontFamily: "Poppins_700Bold",
    includeFontPadding: true,
  },
  textRegular: {
    fontFamily: "Poppins_400Regular",
    includeFontPadding: true,
  },
});
