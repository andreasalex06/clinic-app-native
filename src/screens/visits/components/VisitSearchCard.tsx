import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type SearchItem = {
  id: string;
  name: string;
  phone?: string;
  specialization?: string;
};

type VisitSearchCardProps<T extends SearchItem> = {
  title: string;
  placeholder: string;
  search: string;
  data: T[];
  selectedItem: T | null;
  emptyText: string;
  onSearchChange: (value: string) => void;
  onSelect: (item: T) => void;
};

export function VisitSearchCard<T extends SearchItem>({
  title,
  placeholder,
  search,
  data,
  selectedItem,
  emptyText,
  onSearchChange,
  onSelect,
}: VisitSearchCardProps<T>) {
  return (
    <View className="rounded-3xl bg-white p-4">
      <Text className="text-base text-slate-950" style={styles.textBold}>
        {title}
      </Text>

      <View className="mt-3 flex-row items-center gap-3 rounded-2xl bg-slate-100 px-4">
        <FontAwesome color="#64748b" name="search" size={15} />
        <TextInput
          className="min-h-12 flex-1 text-sm text-slate-950"
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          style={styles.textRegular}
          value={search}
        />
      </View>

      {selectedItem ? (
        <View className="mt-3 rounded-2xl bg-primary-50 px-4 py-3">
          <Text className="text-sm text-primary-700" style={styles.textBold}>
            Dipilih: {selectedItem.name}
          </Text>
        </View>
      ) : null}

      <View className="mt-3 gap-2">
        {data.length === 0 ? (
          <Text className="text-sm text-slate-500" style={styles.textRegular}>
            {emptyText}
          </Text>
        ) : (
          data.slice(0, 4).map((item) => {
            const active = selectedItem?.id === item.id;

            return (
              <Pressable
                className="rounded-2xl border px-4 py-3 active:opacity-80"
                key={item.id}
                onPress={() => onSelect(item)}
                style={active ? styles.activeItem : styles.item}
              >
                <Text style={[styles.textBold, active ? styles.activeText : styles.titleText]}>
                  {item.name}
                </Text>
                <Text className="mt-1 text-xs text-slate-500" style={styles.textRegular}>
                  {item.specialization || item.phone || "-"}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textBold: {
    fontFamily: "Poppins_700Bold",
    includeFontPadding: true,
  },
  textRegular: {
    fontFamily: "Poppins_400Regular",
    includeFontPadding: true,
  },
  activeItem: {
    backgroundColor: "#ecfdf5",
    borderColor: "#059669",
  },
  item: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  activeText: {
    color: "#047857",
  },
  titleText: {
    color: "#020617",
  },
});
