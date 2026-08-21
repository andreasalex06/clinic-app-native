import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GENDER_LABEL, Patient, PatientForm } from "../types";
import { PatientInput } from "./PatientInput";

type PatientFormModalProps = {
  visible: boolean;
  form: PatientForm;
  selectedPatient: Patient | null;
  saving: boolean;
  formError: string;
  onClose: () => void;
  onSubmit: () => void;
  onChangeForm: (key: keyof PatientForm, value: string) => void;
};

export function PatientFormModal({
  visible,
  form,
  selectedPatient,
  saving,
  formError,
  onClose,
  onSubmit,
  onChangeForm,
}: PatientFormModalProps) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={styles.backdrop}>
        <SafeAreaView edges={["bottom"]} style={styles.modalSafeArea}>
          <View className="rounded-t-[32px] bg-white px-5 pt-5">
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-xl leading-7 text-slate-950" style={styles.textBold}>
                  {selectedPatient ? "Edit Pasien" : "Tambah Pasien"}
                </Text>
                <Text className="mt-1 text-xs text-slate-500" style={styles.textRegular}>
                  {selectedPatient ? "Perbarui data pasien." : "Isi data pasien baru."}
                </Text>
              </View>
              <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:opacity-80" onPress={onClose}>
                <FontAwesome color="#334155" name="close" size={16} />
              </Pressable>
            </View>

            {formError ? (
              <View className="mb-4 rounded-2xl bg-rose-50 p-3">
                <Text className="text-xs leading-5 text-rose-700" style={styles.textSemiBold}>
                  {formError}
                </Text>
              </View>
            ) : null}

            <PatientInput label="Nama" onChangeText={(value) => onChangeForm("name", value)} placeholder="Contoh: Budi Santoso" value={form.name} />
            <PatientInput
              keyboardType="phone-pad"
              label="Nomor Telepon"
              onChangeText={(value) => onChangeForm("phone", value)}
              placeholder="Contoh: 081234567890"
              value={form.phone}
            />

            <Text className="mb-2 mt-1 text-xs text-slate-500" style={styles.textSemiBold}>
              Jenis Kelamin
            </Text>
            <View className="mb-4 flex-row gap-2">
              {(["MALE", "FEMALE"] as const).map((gender) => {
                const active = form.gender === gender;

                return (
                  <Pressable
                    key={gender}
                    className={`min-h-11 flex-1 items-center justify-center rounded-2xl border px-4 ${
                      active ? "border-primary-600 bg-primary-50" : "border-slate-200 bg-white"
                    }`}
                    onPress={() => onChangeForm("gender", gender)}
                  >
                    <Text className={active ? "text-primary-700" : "text-slate-500"} style={styles.textSemiBold}>
                      {GENDER_LABEL[gender]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <PatientInput label="Tanggal Lahir" onChangeText={(value) => onChangeForm("birthDate", value)} placeholder="YYYY-MM-DD" value={form.birthDate} />
            <PatientInput
              label="Alamat"
              multiline
              onChangeText={(value) => onChangeForm("address", value)}
              placeholder="Alamat lengkap pasien"
              value={form.address}
            />

            <Pressable
              className="mt-3 min-h-12 items-center justify-center rounded-2xl bg-primary-600 px-4 active:opacity-80 disabled:opacity-60"
              disabled={saving}
              onPress={onSubmit}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-sm text-white" style={styles.textBold}>
                  {selectedPatient ? "Update Pasien" : "Simpan Pasien"}
                </Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalSafeArea: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
