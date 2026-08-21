import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiGet, apiPatch, apiPost } from "@/api/client";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";

import { VisitQueueCard } from "./components/VisitQueueCard";
import { VisitSearchCard } from "./components/VisitSearchCard";
import { Visit, VisitDoctor, VisitPatient, VisitStatus } from "./types";

const PRIMARY_600 = "#059669";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function VisitsScreen() {
  const navigation = useNavigation<RootNavigation>();
  const token = useAuthStore((state) => state.token);
  const [patients, setPatients] = useState<VisitPatient[]>([]);
  const [doctors, setDoctors] = useState<VisitDoctor[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [debouncedPatientSearch, setDebouncedPatientSearch] = useState("");
  const [debouncedDoctorSearch, setDebouncedDoctorSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<VisitPatient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<VisitDoctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingVisitId, setUpdatingVisitId] = useState("");
  const [error, setError] = useState("");

  const patientQuery = debouncedPatientSearch.trim().toLowerCase();
  const doctorQuery = debouncedDoctorSearch.trim().toLowerCase();
  const filteredPatients = patientQuery
    ? patients.filter((patient) => patient.name.toLowerCase().includes(patientQuery) || patient.phone.includes(patientQuery))
    : patients;
  const filteredDoctors = doctorQuery
    ? doctors.filter((doctor) => doctor.name.toLowerCase().includes(doctorQuery) || doctor.specialization.toLowerCase().includes(doctorQuery))
    : doctors;

  const fetchVisitData = useCallback(async () => {
    if (!token) return;

    const [patientsResponse, doctorsResponse, visitsResponse] = await Promise.all([
      apiGet<{ data: VisitPatient[] }>("/patients", token),
      apiGet<{ data: VisitDoctor[] }>("/doctors", token),
      apiGet<{ data: Visit[] }>("/visits?date=today", token),
    ]);

    setPatients(patientsResponse.data);
    setDoctors(doctorsResponse.data);
    setVisits(visitsResponse.data);
  }, [token]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedPatientSearch(patientSearch);
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [patientSearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedDoctorSearch(doctorSearch);
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [doctorSearch]);

  useEffect(() => {
    async function loadVisits() {
      try {
        setLoading(true);
        setError("");
        await fetchVisitData();
      } catch (visitError) {
        setError(visitError instanceof Error ? visitError.message : "Gagal memuat data antrean");
      } finally {
        setLoading(false);
      }
    }

    void loadVisits();
  }, [fetchVisitData]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");
      await fetchVisitData();
    } catch (visitError) {
      setError(visitError instanceof Error ? visitError.message : "Gagal memuat data antrean");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCheckIn() {
    if (!selectedPatient || !selectedDoctor) {
      setError("Pilih pasien dan dokter terlebih dahulu.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await apiPost("/visits", {
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id,
      }, token);

      setSelectedPatient(null);
      setSelectedDoctor(null);
      setPatientSearch("");
      setDoctorSearch("");
      setDebouncedPatientSearch("");
      setDebouncedDoctorSearch("");
      await fetchVisitData();
    } catch (visitError) {
      setError(visitError instanceof Error ? visitError.message : "Gagal check in antrean");
    } finally {
      setSaving(false);
    }
  }

  async function updateVisitStatus(visit: Visit, status: VisitStatus) {
    try {
      setUpdatingVisitId(visit.id);
      setError("");
      await apiPatch(`/visits/${visit.id}/status`, { status }, token);
      await fetchVisitData();

      if (status === "IN_CONSULTATION") {
        navigation.navigate("ConsultationForm", {
          visit,
        });
      }
    } catch (visitError) {
      setError(visitError instanceof Error ? visitError.message : "Gagal mengubah status antrean");
    } finally {
      setUpdatingVisitId("");
    }
  }

  function openConsultationForm(visit: Visit) {
    navigation.navigate("ConsultationForm", {
      visit,
    });
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color="#059669" />
        <Text className="mt-4 text-sm text-slate-500" style={styles.textSemiBold}>
          Memuat antrean...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View className="min-h-[76px] flex-row items-center justify-between gap-3 px-5 pb-4 pt-3">
          <View>
            <Text className="text-[22px] leading-7 text-white" style={styles.textBold}>
              Visits
            </Text>
            <Text className="mt-1 text-xs text-primary-50" style={styles.textRegular}>
              Registrasi antrean pasien
            </Text>
          </View>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/15 active:opacity-80" onPress={handleRefresh}>
            <FontAwesome color="#ecfdf5" name="refresh" size={16} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} tintColor="#059669" onRefresh={handleRefresh} />}
      >
        <View className="rounded-3xl bg-primary-600 p-5">
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[20px] leading-7 text-white" style={styles.textBold}>
                Antrean Hari Ini
              </Text>
              <Text className="mt-2 text-sm leading-6 text-primary-50" style={styles.textRegular}>
                Pilih pasien dan dokter untuk membuat antrean kunjungan.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <FontAwesome color="#ecfdf5" name="stethoscope" size={22} />
            </View>
          </View>

          <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
            <Text className="text-xs text-primary-50" style={styles.textRegular}>
              Total antrean
            </Text>
            <Text className="text-base text-white" style={styles.textBold}>
              {visits.length}
            </Text>
          </View>
        </View>

        {error ? (
          <View className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <Text className="text-sm leading-5 text-rose-700" style={styles.textSemiBold}>
              {error}
            </Text>
          </View>
        ) : null}

        <VisitSearchCard
          data={filteredPatients}
          emptyText="Pasien tidak ditemukan."
          placeholder="Cari nama atau nomor telepon"
          search={patientSearch}
          selectedItem={selectedPatient}
          title="Cari Pasien"
          onSearchChange={setPatientSearch}
          onSelect={setSelectedPatient}
        />

        <VisitSearchCard
          data={filteredDoctors}
          emptyText="Dokter tidak ditemukan."
          placeholder="Cari nama atau spesialis"
          search={doctorSearch}
          selectedItem={selectedDoctor}
          title="Cari Dokter"
          onSearchChange={setDoctorSearch}
          onSelect={setSelectedDoctor}
        />

        <Pressable
          className="rounded-2xl px-5 py-4 active:opacity-80"
          disabled={saving}
          onPress={handleCheckIn}
          style={saving ? styles.disabledCheckInButton : styles.checkInButton}
        >
          <Text className="text-center text-base text-white" style={styles.textBold}>
            {saving ? "Mendaftarkan..." : "Check In Antrean"}
          </Text>
        </Pressable>

        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-[18px] leading-6 text-slate-950" style={styles.textBold}>
            Daftar Antrean
          </Text>
          <Text className="text-xs text-slate-500" style={styles.textRegular}>
            {visits.length} antrean
          </Text>
        </View>

        {visits.length === 0 ? (
          <View className="rounded-3xl border border-dashed border-primary-200 bg-primary-50/60 p-6">
            <Text className="text-center text-sm leading-5 text-slate-500" style={styles.textSemiBold}>
              Belum ada antrean hari ini.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {visits.map((visit) => (
              <VisitQueueCard
                key={visit.id}
                updating={updatingVisitId === visit.id}
                visit={visit}
                onCancel={(selectedVisit) => updateVisitStatus(selectedVisit, "CANCELLED")}
                onContinue={openConsultationForm}
                onStart={(selectedVisit) => updateVisitStatus(selectedVisit, "IN_CONSULTATION")}
              />
            ))}
          </View>
        )}
      </ScrollView>
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
  headerSafeArea: {
    backgroundColor: PRIMARY_600,
  },
  checkInButton: {
    backgroundColor: PRIMARY_600,
  },
  disabledCheckInButton: {
    backgroundColor: "#34d399",
  },
  textBold: {
    fontFamily: "Poppins_700Bold",
    includeFontPadding: true,
  },
  textRegular: {
    fontFamily: "Poppins_400Regular",
    includeFontPadding: true,
  },
  textSemiBold: {
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: true,
  },
});
