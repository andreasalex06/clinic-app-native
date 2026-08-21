import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiGet, apiPatch, apiPost } from "@/api/client";
import { useAuthStore } from "@/stores/authStore";
import { PatientCard } from "./components/PatientCard";
import { PatientFormModal } from "./components/PatientFormModal";
import { EMPTY_FORM, Patient, PatientForm } from "./types";

const PRIMARY_600 = "#059669";

function isValidDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

export function PatientsScreen() {
  const hasLoadedPatients = useRef(false);
  const token = useAuthStore((state) => state.token);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<PatientForm>(EMPTY_FORM);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const fetchPatients = useCallback(async (searchTerm: string) => {
    if (!token) return;

    setError("");

    const query = searchTerm.trim() ? `?search=${encodeURIComponent(searchTerm.trim())}` : "";
    const response = await apiGet<{ data: Patient[] }>(`/patients${query}`, token);

    setPatients(response.data);
  }, [token]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [search]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        await fetchPatients("");
        hasLoadedPatients.current = true;
      } catch (patientError) {
        setError(patientError instanceof Error ? patientError.message : "Gagal memuat data pasien");
      } finally {
        setLoading(false);
      }
    }

    void loadInitialData();
  }, [fetchPatients]);

  useEffect(() => {
    if (!hasLoadedPatients.current) return;

    async function searchPatients() {
      try {
        setSearching(true);
        await fetchPatients(debouncedSearch);
      } catch (patientError) {
        setError(patientError instanceof Error ? patientError.message : "Gagal mencari data pasien");
      } finally {
        setSearching(false);
      }
    }

    void searchPatients();
  }, [debouncedSearch, fetchPatients]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await fetchPatients(debouncedSearch);
    } catch (patientError) {
      setError(patientError instanceof Error ? patientError.message : "Gagal memuat data pasien");
    } finally {
      setRefreshing(false);
    }
  }

  function openCreateForm() {
    setSelectedPatient(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalVisible(true);
  }

  function openEditForm(patient: Patient) {
    setSelectedPatient(patient);
    setForm({
      name: patient.name,
      phone: patient.phone,
      gender: patient.gender,
      birthDate: patient.birthDate.slice(0, 10),
      address: patient.address,
    });
    setFormError("");
    setModalVisible(true);
  }

  function closeCreateForm() {
    if (saving) return;
    setModalVisible(false);
    setSelectedPatient(null);
    setFormError("");
  }

  function updateForm(key: keyof PatientForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function validateForm() {
    if (form.name.trim().length < 2) return "Nama minimal 2 karakter.";
    if (form.phone.trim().length < 8) return "Nomor telepon minimal 8 karakter.";
    if (!isValidDateInput(form.birthDate.trim())) return "Tanggal lahir wajib format YYYY-MM-DD.";
    if (form.address.trim().length < 5) return "Alamat minimal 5 karakter.";

    return "";
  }

  async function handleSavePatient() {
    const validationMessage = validateForm();

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const patientPayload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        birthDate: form.birthDate.trim(),
        address: form.address.trim(),
      };

      if (selectedPatient) {
        await apiPatch(`/patients/${selectedPatient.id}`, patientPayload, token);
      } else {
        await apiPost("/patients", patientPayload, token);
      }

      setModalVisible(false);
      setSelectedPatient(null);
      setForm(EMPTY_FORM);
      setSearch("");

      const response = await apiGet<{ data: Patient[] }>("/patients", token);
      setPatients(response.data);
    } catch (patientError) {
      setFormError(patientError instanceof Error ? patientError.message : "Gagal menyimpan pasien");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color="#059669" />
        <Text className="mt-4 text-sm text-slate-500" style={styles.textSemiBold}>
          Memuat pasien...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View className="min-h-[76px] justify-center px-5 pb-4 pt-3">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-[22px] leading-7 text-white" style={styles.textBold}>
                Patients
              </Text>
            </View>

            <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/15 active:opacity-80" onPress={openCreateForm}>
              <FontAwesome color="#ecfdf5" name="plus" size={17} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} tintColor="#059669" onRefresh={handleRefresh} />}
      >
        <View className="mb-5 rounded-3xl bg-primary-600 p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[20px] leading-7 text-white" style={styles.textBold}>
                Data Pasien Klinik
              </Text>
              <Text className="mt-2 text-sm leading-6 text-primary-50" style={styles.textRegular}>
                Kelola data pasien sebelum pendaftaran antrean dimulai.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <FontAwesome color="#ecfdf5" name="users" size={22} />
            </View>
          </View>

          <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
            <Text className="text-xs text-primary-50" style={styles.textRegular}>
              Total pasien
            </Text>
            <Text className="text-base text-white" style={styles.textBold}>
              {patients.length}
            </Text>
          </View>
        </View>

        {error ? (
          <View className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <Text className="text-sm leading-5 text-rose-700" style={styles.textSemiBold}>
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mb-3 flex-row items-center justify-between gap-4">
          <View className="min-w-0 flex-1">
            <Text className="text-[18px] leading-6 text-slate-950" style={styles.textBold}>
              Daftar Pasien
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-2">
              {searching ? <ActivityIndicator color="#059669" size="small" /> : null}
              <Text className="text-xs text-slate-500" style={styles.textRegular}>
                {searching ? "Mencari pasien..." : `${patients.length} pasien ditemukan`}
              </Text>
            </View>
            <Pressable className="rounded-full bg-primary-50 px-4 py-2 active:opacity-80" onPress={handleRefresh}>
              <Text className="text-xs text-primary-700" style={styles.textBold}>
                Refresh
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-3 flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
          <FontAwesome color="#64748b" name="search" size={15} />
          <TextInput
            className="min-h-12 flex-1 text-sm text-slate-950"
            onChangeText={setSearch}
            placeholder="Cari nama atau nomor telepon"
            placeholderTextColor="#94a3b8"
            returnKeyType="search"
            style={styles.textRegular}
            value={search}
          />
        </View>

        {patients.length === 0 ? (
          <View className="rounded-3xl border border-dashed border-primary-200 bg-primary-50/60 p-6">
            <Text className="text-center text-sm leading-5 text-slate-500" style={styles.textSemiBold}>
              Belum ada data pasien.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} onEdit={openEditForm} />
            ))}
          </View>
        )}
      </ScrollView>

      <PatientFormModal
        form={form}
        formError={formError}
        saving={saving}
        selectedPatient={selectedPatient}
        visible={modalVisible}
        onChangeForm={updateForm}
        onClose={closeCreateForm}
        onSubmit={handleSavePatient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSafeArea: {
    backgroundColor: PRIMARY_600,
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
