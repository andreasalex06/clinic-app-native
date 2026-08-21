import { StyleSheet, Text, TextInput, View } from "react-native";

type PatientInputProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "phone-pad";
  multiline?: boolean;
};

export function PatientInput({ label, value, placeholder, onChangeText, keyboardType = "default", multiline = false }: PatientInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs text-slate-500" style={styles.textSemiBold}>
        {label}
      </Text>
      <TextInput
        className={`rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 ${multiline ? "min-h-24 py-3" : "min-h-12"}`}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={[styles.textRegular, multiline ? styles.multilineInput : undefined]}
        textAlignVertical={multiline ? "top" : "center"}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  multilineInput: {
    lineHeight: 21,
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
