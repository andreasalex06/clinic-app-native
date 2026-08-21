import { Text, TextInput, View } from "react-native";

import { consultationStyles } from "./styles";

type ConsultationTextAreaProps = {
  label: string;
  minHeightClassName: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
};

export function ConsultationTextArea({
  label,
  minHeightClassName,
  placeholder,
  value,
  onChangeText,
}: ConsultationTextAreaProps) {
  return (
    <View className="mt-5">
      <Text className="mb-2 text-sm text-slate-600" style={consultationStyles.textSemiBold}>
        {label}
      </Text>
      <TextInput
        className={`${minHeightClassName} rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950`}
        multiline
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={consultationStyles.textRegular}
        textAlignVertical="top"
        underlineColorAndroid="transparent"
        value={value}
      />
    </View>
  );
}
