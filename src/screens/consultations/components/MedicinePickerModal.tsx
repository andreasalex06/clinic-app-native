import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text, TextInput, View } from "react-native";

import { formatCurrency, Medicine, SelectedMedicine } from "../types";
import { PickerModalFrame } from "./PickerModalFrame";
import { consultationStyles } from "./styles";

type MedicinePickerModalProps = {
  medicines: Medicine[];
  selectedMedicines: SelectedMedicine[];
  visible: boolean;
  onChangeInstructions: (medicineId: string, instructions: string) => void;
  onChangeQuantity: (medicineId: string, quantity: number) => void;
  onClose: () => void;
  onToggleMedicine: (medicineId: string) => void;
};

export function MedicinePickerModal({
  medicines,
  selectedMedicines,
  visible,
  onChangeInstructions,
  onChangeQuantity,
  onClose,
  onToggleMedicine,
}: MedicinePickerModalProps) {
  return (
    <PickerModalFrame title="Pilih Obat" visible={visible} onClose={onClose}>
      {medicines.map((medicine) => {
        const selectedMedicine = selectedMedicines.find((item) => item.medicineId === medicine.id);
        const active = Boolean(selectedMedicine);

        return (
          <View
            className="rounded-2xl border px-4 py-3"
            key={medicine.id}
            style={active ? consultationStyles.activeOption : consultationStyles.option}
          >
            <Pressable className="flex-row items-center gap-3 active:opacity-80" onPress={() => onToggleMedicine(medicine.id)}>
              <View
                className="h-5 w-5 items-center justify-center rounded border"
                style={active ? consultationStyles.checkedBox : consultationStyles.checkbox}
              >
                {active ? <FontAwesome color="#ffffff" name="check" size={11} /> : null}
              </View>
              <View className="flex-1">
                <Text style={[consultationStyles.textBold, active ? consultationStyles.activeText : consultationStyles.optionTitle]}>
                  {medicine.name}
                </Text>
                <Text className="mt-1 text-xs text-slate-500" style={consultationStyles.textRegular}>
                  {formatCurrency(medicine.price)} - stok {medicine.stock}
                </Text>
              </View>
            </Pressable>

            {selectedMedicine ? (
              <View className="mt-3 gap-3 rounded-xl bg-white px-3 py-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500" style={consultationStyles.textRegular}>
                    Kuantitas
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
                      onPress={() => onChangeQuantity(medicine.id, selectedMedicine.quantity - 1)}
                    >
                      <FontAwesome color="#64748b" name="minus" size={10} />
                    </Pressable>
                    <Text className="min-w-6 text-center text-sm text-slate-950" style={consultationStyles.textBold}>
                      {selectedMedicine.quantity}
                    </Text>
                    <Pressable
                      className="h-8 w-8 items-center justify-center rounded-full bg-primary-600"
                      onPress={() => onChangeQuantity(medicine.id, selectedMedicine.quantity + 1)}
                    >
                      <FontAwesome color="#ffffff" name="plus" size={10} />
                    </Pressable>
                  </View>
                </View>
                <View>
                  <View className="mb-1.5 flex-row items-center justify-between gap-3">
                    <Text className="text-xs text-slate-600" style={consultationStyles.textSemiBold}>
                      Catatan aturan pakai
                    </Text>
                    <Text className="text-xs text-slate-400" style={consultationStyles.textRegular}>
                      {selectedMedicine.instructions.length}/200
                    </Text>
                  </View>
                  <TextInput
                    className="min-h-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950"
                    maxLength={200}
                    multiline
                    placeholder="Contoh: 3x1 sesudah makan, habiskan"
                    placeholderTextColor="#94a3b8"
                    style={consultationStyles.textRegular}
                    textAlignVertical="top"
                    value={selectedMedicine.instructions}
                    onChangeText={(value) => onChangeInstructions(medicine.id, value)}
                  />
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </PickerModalFrame>
  );
}
