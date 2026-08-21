import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY_600 = "#059669";

export function InvoicesScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View className="min-h-[76px] justify-center px-5 pb-4 pt-3">
          <Text className="text-[22px] leading-7 text-white" style={styles.textBold}>
            Invoices
          </Text>
        </View>
      </SafeAreaView>

      <View className="flex-1 justify-center px-6">
        <Text className="mb-2 text-3xl text-slate-950" style={styles.textBold}>
          Invoices
        </Text>
        <Text className="text-base leading-6 text-slate-600" style={styles.textRegular}>
          Data tagihan, detail pembayaran, dan status invoice akan dibangun di tahap MVP berikutnya.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSafeArea: {
    backgroundColor: PRIMARY_600,
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
