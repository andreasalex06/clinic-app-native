import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Visit, VISIT_STATUS_LABEL } from "../types";

type VisitQueueCardProps = {
  visit: Visit;
  updating: boolean;
  onStart: (visit: Visit) => void;
  onCancel: (visit: Visit) => void;
  onContinue: (visit: Visit) => void;
};

const STATUS_CLASS = {
  WAITING: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },
  IN_CONSULTATION: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
  },
  COMPLETED: {
    backgroundColor: "#d1fae5",
    color: "#047857",
  },
  CANCELLED: {
    backgroundColor: "#ffe4e6",
    color: "#be123c",
  },
};

export function VisitQueueCard({ visit, updating, onStart, onCancel, onContinue }: VisitQueueCardProps) {
  const canManage = visit.status === "WAITING";
  const canContinue = visit.status === "IN_CONSULTATION";

  return (
    <View className="rounded-3xl bg-primary-700 p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs text-primary-100" style={styles.textRegular}>
            {visit.visitNumber}
          </Text>
          <Text className="mt-1 text-base text-white" style={styles.textBold}>
            {visit.patient.name}
          </Text>
          <Text className="mt-1 text-xs text-primary-50" style={styles.textRegular}>
            Dr. {visit.doctor.name} - {visit.doctor.specialization}
          </Text>
        </View>

        <View className="rounded-full px-3 py-1" style={{ backgroundColor: STATUS_CLASS[visit.status].backgroundColor }}>
          <Text className="text-xs" style={[styles.textBold, { color: STATUS_CLASS[visit.status].color }]}>
            {VISIT_STATUS_LABEL[visit.status]}
          </Text>
        </View>
      </View>

      {canManage ? (
        <View className="mt-4 flex-row gap-3">
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3"
            disabled={updating}
            onPress={() => onStart(visit)}
            style={styles.startButton}
          >
            <FontAwesome color="#047857" name="play" size={12} />
            <Text className="text-primary-700" style={styles.textBold}>
              Mulai
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3"
            disabled={updating}
            onPress={() => onCancel(visit)}
            style={styles.cancelButton}
          >
            <FontAwesome color="#ecfdf5" name="times" size={12} />
            <Text className="text-primary-50" style={styles.textBold}>
              Batalkan
            </Text>
          </Pressable>
        </View>
      ) : null}

      {canContinue ? (
        <Pressable
          className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 active:opacity-80"
          disabled={updating}
          onPress={() => onContinue(visit)}
        >
          <FontAwesome color="#047857" name="clipboard" size={13} />
          <Text className="text-primary-700" style={styles.textBold}>
            Lanjutkan Konsultasi
          </Text>
        </Pressable>
      ) : null}
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
  startButton: {
    backgroundColor: "#ffffff",
  },
  cancelButton: {
    backgroundColor: "#dc2626",
  },
});
