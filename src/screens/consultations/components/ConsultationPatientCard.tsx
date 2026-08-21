import { Text, View } from "react-native";

import { Visit } from "@/screens/visits/types";

import { consultationStyles } from "./styles";

export function ConsultationPatientCard({ visit }: { visit: Visit }) {
  return (
    <View className="rounded-3xl bg-white p-5">
      <View className="border-b border-slate-100 pb-4">
        <Text className="text-lg text-slate-950" style={consultationStyles.textBold}>
          {visit.patient.name}
        </Text>
        <Text className="mt-1 text-xs text-primary-700" style={consultationStyles.textRegular}>
          {visit.visitNumber}
        </Text>
      </View>

      <View className="mt-4 gap-3">
        <InfoRow label="Dokter" value={`Dr. ${visit.doctor.name}`} />
        <InfoRow label="Status" value="Dalam konsultasi" />
        <InfoRow label="Telepon" value={visit.patient.phone} />
        <InfoRow label="Alamat" value={visit.patient.address} />
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xs text-slate-500" style={consultationStyles.textRegular}>
        {label}
      </Text>
      <Text className="mt-1 text-sm text-slate-950" style={consultationStyles.textSemiBold}>
        {value}
      </Text>
    </View>
  );
}
