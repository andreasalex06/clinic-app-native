import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text, View } from "react-native";

import { consultationStyles } from "./styles";

export function PickerSummary({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable className="rounded-2xl border border-slate-200 bg-white px-4 py-3 active:opacity-80" onPress={onPress}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-sm text-slate-950" style={consultationStyles.textBold}>
            {title}
          </Text>
          <Text className="mt-1 text-xs text-slate-500" numberOfLines={2} style={consultationStyles.textRegular}>
            {subtitle}
          </Text>
        </View>
        <FontAwesome color="#64748b" name="chevron-right" size={13} />
      </View>
    </Pressable>
  );
}
