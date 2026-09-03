import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatCurrency, formatDate, InvoiceListItem } from "../types";

type InvoiceCardProps = {
  invoice: InvoiceListItem;
  onPress: (invoice: InvoiceListItem) => void;
};

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const paid = invoice.status === "PAID";

  return (
    <Pressable className="rounded-2xl border border-slate-200 bg-white p-4 active:opacity-80" onPress={() => onPress(invoice)} style={styles.card}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs text-primary-700" style={styles.textRegular}>
            {invoice.invoiceNo}
          </Text>
          <Text className="mt-1 text-base text-slate-950" style={styles.textBold}>
            {invoice.visit.patient.name}
          </Text>
          <Text className="mt-1 text-xs text-slate-500" style={styles.textRegular}>
            {invoice.visit.visitNumber} - {formatDate(invoice.createdAt)}
          </Text>
        </View>

        <View className={paid ? "rounded-full bg-emerald-100 px-3 py-1" : "rounded-full bg-amber-100 px-3 py-1"}>
          <Text className={paid ? "text-xs text-emerald-700" : "text-xs text-amber-700"} style={styles.textBold}>
            {paid ? "Lunas" : "Belum Lunas"}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
        <View>
          <Text className="text-xs text-slate-500" style={styles.textRegular}>
            Total tagihan
          </Text>
          <Text className="mt-1 text-base text-slate-950" style={styles.textBold}>
            {formatCurrency(invoice.total)}
          </Text>
        </View>
        <FontAwesome color="#64748b" name="chevron-right" size={14} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  textBold: {
    fontFamily: "Poppins_700Bold",
    includeFontPadding: true,
  },
  textRegular: {
    fontFamily: "Poppins_400Regular",
    includeFontPadding: true,
  },
});
