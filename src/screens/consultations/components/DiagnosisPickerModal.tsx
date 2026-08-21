import { Pressable, Text } from "react-native";

import { Diagnosis } from "../types";
import { PickerModalFrame } from "./PickerModalFrame";
import { consultationStyles } from "./styles";

type DiagnosisPickerModalProps = {
  diagnoses: Diagnosis[];
  selectedDiagnosisId: string;
  visible: boolean;
  onClose: () => void;
  onSelect: (diagnosisId: string) => void;
};

export function DiagnosisPickerModal({
  diagnoses,
  selectedDiagnosisId,
  visible,
  onClose,
  onSelect,
}: DiagnosisPickerModalProps) {
  return (
    <PickerModalFrame title="Pilih Diagnosis" visible={visible} onClose={onClose}>
      {diagnoses.map((diagnosis) => {
        const active = selectedDiagnosisId === diagnosis.id;

        return (
          <Pressable
            className="rounded-2xl border px-4 py-3 active:opacity-80"
            key={diagnosis.id}
            onPress={() => {
              onSelect(diagnosis.id);
              onClose();
            }}
            style={active ? consultationStyles.activeOption : consultationStyles.option}
          >
            <Text style={[consultationStyles.textBold, active ? consultationStyles.activeText : consultationStyles.optionTitle]}>
              {diagnosis.name}
            </Text>
            <Text className="mt-1 text-xs text-slate-500" style={consultationStyles.textRegular}>
              {diagnosis.code}
            </Text>
          </Pressable>
        );
      })}
    </PickerModalFrame>
  );
}
