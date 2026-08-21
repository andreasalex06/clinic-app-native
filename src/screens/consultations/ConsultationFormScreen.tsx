import FontAwesome from "@expo/vector-icons/FontAwesome";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiGet, apiPost } from "@/api/client";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";

import { ConsultationHero } from "./components/ConsultationHero";
import { ConsultationPatientCard } from "./components/ConsultationPatientCard";
import { ConsultationTextArea } from "./components/ConsultationTextArea";
import { DiagnosisPickerModal } from "./components/DiagnosisPickerModal";
import { MedicinePickerModal } from "./components/MedicinePickerModal";
import { PickerSummary } from "./components/PickerSummary";
import { consultationStyles, PRIMARY_600 } from "./components/styles";
import { TreatmentPickerModal } from "./components/TreatmentPickerModal";
import { Diagnosis, Medicine, SelectedMedicine, Treatment } from "./types";

type ConsultationFormScreenProps = NativeStackScreenProps<RootStackParamList, "ConsultationForm">;

export function ConsultationFormScreen({ navigation, route }: ConsultationFormScreenProps) {
  const { visit } = route.params;

  const token = useAuthStore((state) => state.token);

  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState("");
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicine[]>([]);

  const [complaint, setComplaint] = useState("");
  const [notes, setNotes] = useState("");

  const [diagnosisModalVisible, setDiagnosisModalVisible] = useState(false);
  const [treatmentModalVisible, setTreatmentModalVisible] = useState(false);
  const [medicineModalVisible, setMedicineModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedDiagnosis = diagnoses.find((diagnosis) => diagnosis.id === selectedDiagnosisId) || null;
  const selectedTreatments = treatments.filter((treatment) => selectedTreatmentIds.includes(treatment.id));
  const selectedMedicineDetails = selectedMedicines
    .map((selectedMedicine) => {
      const medicine = medicines.find((item) => item.id === selectedMedicine.medicineId);
      if (!medicine) return null;

      return {
        ...medicine,
        quantity: selectedMedicine.quantity,
      };
    })
    .filter((medicine): medicine is Medicine & { quantity: number } => Boolean(medicine));

  const loadMasterData = useCallback(async () => {
    if (!token) return;

    const [diagnosesResponse, treatmentsResponse, medicinesResponse] = await Promise.all([
      apiGet<{ data: Diagnosis[] }>("/diagnoses", token),
      apiGet<{ data: Treatment[] }>("/treatments", token),
      apiGet<{ data: Medicine[] }>("/medicines", token),
    ]);

    setDiagnoses(diagnosesResponse.data);
    setTreatments(treatmentsResponse.data);
    setMedicines(medicinesResponse.data);
  }, [token]);

  useEffect(() => {
    async function loadConsultationData() {
      try {
        setLoading(true);
        setError("");
        await loadMasterData();
      } catch (consultationError) {
        setError(consultationError instanceof Error ? consultationError.message : "Gagal memuat data konsultasi");
      } finally {
        setLoading(false);
      }
    }

    void loadConsultationData();
  }, [loadMasterData]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");
      await loadMasterData();
    } catch (consultationError) {
      setError(consultationError instanceof Error ? consultationError.message : "Gagal memuat data konsultasi");
    } finally {
      setRefreshing(false);
    }
  }

  function toggleTreatment(treatmentId: string) {
    setSelectedTreatmentIds((currentIds) => {
      if (currentIds.includes(treatmentId)) {
        return currentIds.filter((id) => id !== treatmentId);
      }

      return [...currentIds, treatmentId];
    });
  }

  function toggleMedicine(medicineId: string) {
    setSelectedMedicines((currentMedicines) => {
      const selected = currentMedicines.find((medicine) => medicine.medicineId === medicineId);

      if (selected) {
        return currentMedicines.filter((medicine) => medicine.medicineId !== medicineId);
      }

      return [...currentMedicines, { medicineId, quantity: 1 }];
    });
  }

  function changeMedicineQuantity(medicineId: string, quantity: number) {
    setSelectedMedicines((currentMedicines) =>
      currentMedicines.map((medicine) => {
        if (medicine.medicineId !== medicineId) return medicine;

        return {
          ...medicine,
          quantity: Math.max(quantity, 1),
        };
      }),
    );
  }

  function validateForm() {
    if (complaint.trim().length < 5) return "Keluhan minimal 5 karakter.";
    if (!selectedDiagnosisId) return "Pilih diagnosis.";
    if (selectedTreatmentIds.length === 0) return "Pilih minimal satu tindakan.";

    return "";
  }

  async function handleSubmitConsultation() {
    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setError("");
      await apiPost(
        "/consultations",
        {
          visitId: visit.id,
          complaint: complaint.trim(),
          diagnosisId: selectedDiagnosisId,
          treatmentIds: selectedTreatmentIds,
          notes: notes.trim() || undefined,
          medicines: selectedMedicines,
        },
        token,
      );

      navigation.navigate("MainTabs", { screen: "Visits" });
    } catch (consultationError) {
      setError(consultationError instanceof Error ? consultationError.message : "Gagal menyelesaikan konsultasi");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color="#059669" />
        <Text className="mt-4 text-sm text-slate-500" style={consultationStyles.textSemiBold}>
          Memuat form konsultasi...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View className="min-h-[76px] flex-row items-center gap-3 px-5 pb-4 pt-3">
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/15" onPress={() => navigation.goBack()}>
            <FontAwesome color="#ecfdf5" name="chevron-left" size={14} />
          </Pressable>
          <Text className="text-[22px] leading-7 text-white" style={consultationStyles.textBold}>
            Konsultasi
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} tintColor="#059669" onRefresh={handleRefresh} />}
      >
        <ConsultationHero visit={visit} />
        <ConsultationPatientCard visit={visit} />

        {error ? (
          <View className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <Text className="text-sm leading-5 text-rose-700" style={consultationStyles.textSemiBold}>
              {error}
            </Text>
          </View>
        ) : null}

        <View className="rounded-3xl bg-white p-5">
          <Text className="text-xl text-slate-950" style={consultationStyles.textBold}>
            Form Konsultasi
          </Text>

          <ConsultationTextArea
            label="Keluhan"
            minHeightClassName="min-h-24"
            placeholder="Contoh: Demam dan sakit kepala sejak 2 hari"
            value={complaint}
            onChangeText={setComplaint}
          />

          <View className="mt-5">
            <Text className="mb-2 text-sm text-slate-600" style={consultationStyles.textSemiBold}>
              Diagnosis
            </Text>
            <PickerSummary
              subtitle={selectedDiagnosis ? selectedDiagnosis.code : "Diagnosis wajib dipilih"}
              title={selectedDiagnosis ? selectedDiagnosis.name : "Pilih diagnosis"}
              onPress={() => setDiagnosisModalVisible(true)}
            />
          </View>

          <View className="mt-5">
            <Text className="mb-2 text-sm text-slate-600" style={consultationStyles.textSemiBold}>
              Biaya & Tindakan
            </Text>
            <PickerSummary
              subtitle={
                selectedTreatments.length
                  ? selectedTreatments.map((treatment) => treatment.name).join(", ")
                  : "Minimal satu tindakan"
              }
              title={selectedTreatments.length ? `${selectedTreatments.length} tindakan dipilih` : "Pilih tindakan"}
              onPress={() => setTreatmentModalVisible(true)}
            />
          </View>

          <View className="mt-5 rounded-2xl border border-primary-100 p-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm text-slate-700" style={consultationStyles.textBold}>
                Obat
              </Text>
              <Text className="text-xs text-primary-700" style={consultationStyles.textRegular}>
                Opsional
              </Text>
            </View>

            <View className="mt-3">
              <PickerSummary
                subtitle={
                  selectedMedicineDetails.length
                    ? selectedMedicineDetails.map((medicine) => `${medicine.name} x${medicine.quantity}`).join(", ")
                    : "Obat boleh dikosongkan"
                }
                title={selectedMedicineDetails.length ? `${selectedMedicineDetails.length} obat dipilih` : "Tambah obat"}
                onPress={() => setMedicineModalVisible(true)}
              />
            </View>
          </View>

          <ConsultationTextArea
            label="Catatan"
            minHeightClassName="min-h-20"
            placeholder="Catatan opsional"
            value={notes}
            onChangeText={setNotes}
          />

          <Pressable
            className="mt-6 rounded-2xl px-5 py-4 active:opacity-80"
            disabled={saving}
            onPress={handleSubmitConsultation}
            style={saving ? styles.disabledButton : styles.submitButton}
          >
            <Text className="text-center text-base text-white" style={consultationStyles.textBold}>
              {saving ? "Menyimpan..." : "Selesaikan Konsultasi"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <DiagnosisPickerModal
        diagnoses={diagnoses}
        selectedDiagnosisId={selectedDiagnosisId}
        visible={diagnosisModalVisible}
        onClose={() => setDiagnosisModalVisible(false)}
        onSelect={setSelectedDiagnosisId}
      />

      <TreatmentPickerModal
        selectedTreatmentIds={selectedTreatmentIds}
        treatments={treatments}
        visible={treatmentModalVisible}
        onClose={() => setTreatmentModalVisible(false)}
        onToggleTreatment={toggleTreatment}
      />

      <MedicinePickerModal
        medicines={medicines}
        selectedMedicines={selectedMedicines}
        visible={medicineModalVisible}
        onChangeQuantity={changeMedicineQuantity}
        onClose={() => setMedicineModalVisible(false)}
        onToggleMedicine={toggleMedicine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  disabledButton: {
    backgroundColor: "#34d399",
  },
  headerSafeArea: {
    backgroundColor: PRIMARY_600,
  },
  submitButton: {
    backgroundColor: PRIMARY_600,
  },
});
