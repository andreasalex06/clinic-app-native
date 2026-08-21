import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text, View } from "react-native";

import { formatCurrency, Treatment } from "../types";
import { PickerModalFrame } from "./PickerModalFrame";
import { consultationStyles } from "./styles";

type TreatmentPickerModalProps = {
  selectedTreatmentIds: string[];
  treatments: Treatment[];
  visible: boolean;
  onClose: () => void;
  onToggleTreatment: (treatmentId: string) => void;
};

export function TreatmentPickerModal({
  selectedTreatmentIds,
  treatments,
  visible,
  onClose,
  onToggleTreatment,
}: TreatmentPickerModalProps) {
  return (
    <PickerModalFrame title="Pilih Tindakan" visible={visible} onClose={onClose}>
      {treatments.map((treatment) => {
        const active = selectedTreatmentIds.includes(treatment.id);

        return (
          <Pressable
            className="rounded-2xl border px-4 py-3 active:opacity-80"
            key={treatment.id}
            onPress={() => onToggleTreatment(treatment.id)}
            style={active ? consultationStyles.activeOption : consultationStyles.option}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="h-5 w-5 items-center justify-center rounded border"
                style={active ? consultationStyles.checkedBox : consultationStyles.checkbox}
              >
                {active ? <FontAwesome color="#ffffff" name="check" size={11} /> : null}
              </View>
              <View className="flex-1">
                <Text style={[consultationStyles.textBold, active ? consultationStyles.activeText : consultationStyles.optionTitle]}>
                  {treatment.name}
                </Text>
                <Text className="mt-1 text-xs text-slate-500" style={consultationStyles.textRegular}>
                  {formatCurrency(treatment.price)}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </PickerModalFrame>
  );
}
