import { Text, View } from "react-native";

export function InvoicesScreen() {
  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <Text className="mb-2 text-3xl font-bold text-slate-950">Invoices</Text>
      <Text className="text-base leading-6 text-slate-600">
        Data tagihan, detail pembayaran, dan status invoice akan dibangun di tahap MVP berikutnya.
      </Text>
    </View>
  );
}
