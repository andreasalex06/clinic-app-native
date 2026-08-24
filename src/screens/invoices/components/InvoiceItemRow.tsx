import { StyleSheet, Text, View } from "react-native";

import { formatCurrency, InvoiceItem } from "../types";

export function InvoiceItemRow({ item }: { item: InvoiceItem }) {
  return (
    <View className="border-b border-slate-100 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-sm text-slate-950" style={styles.textBold}>
            {item.item}
          </Text>
          <Text className="mt-1 text-xs text-slate-500" style={styles.textRegular}>
            {item.quantity} x {formatCurrency(item.price)}
          </Text>
        </View>
        <Text className="text-sm text-slate-950" style={styles.textBold}>
          {formatCurrency(item.amount)}
        </Text>
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
});
