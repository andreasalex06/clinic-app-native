import FontAwesome from "@expo/vector-icons/FontAwesome";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiGet, apiPatch } from "@/api/client";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";

import { InvoiceItemRow } from "./components/InvoiceItemRow";
import { formatCurrency, formatDate, InvoiceDetail } from "./types";

type InvoiceDetailScreenProps = NativeStackScreenProps<RootStackParamList, "InvoiceDetail">;

const PRIMARY_600 = "#059669";

export function InvoiceDetailScreen({ navigation, route }: InvoiceDetailScreenProps) {
  const { visitId } = route.params;
  const token = useAuthStore((state) => state.token);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const fetchInvoice = useCallback(async () => {
    if (!token) return;

    const response = await apiGet<{ data: InvoiceDetail }>(`/invoices/${visitId}`, token);
    setInvoice(response.data);
  }, [token, visitId]);

  useEffect(() => {
    async function loadInvoice() {
      try {
        setLoading(true);
        setError("");
        await fetchInvoice();
      } catch (invoiceError) {
        setError(invoiceError instanceof Error ? invoiceError.message : "Gagal memuat detail invoice");
      } finally {
        setLoading(false);
      }
    }

    void loadInvoice();
  }, [fetchInvoice]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");
      await fetchInvoice();
    } catch (invoiceError) {
      setError(invoiceError instanceof Error ? invoiceError.message : "Gagal memuat detail invoice");
    } finally {
      setRefreshing(false);
    }
  }

  async function handlePayInvoice() {
    if (!invoice) return;

    try {
      setPaying(true);
      setError("");
      const response = await apiPatch<{ data: InvoiceDetail }>(`/invoices/${invoice.id}/pay`, {}, token);
      setInvoice(response.data);
    } catch (invoiceError) {
      setError(invoiceError instanceof Error ? invoiceError.message : "Gagal menandai invoice lunas");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color="#059669" />
        <Text className="mt-4 text-sm text-slate-500" style={styles.textSemiBold}>
          Memuat invoice...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View className="min-h-[76px] flex-row items-center gap-3 px-5 pb-4 pt-3">
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/15" onPress={() => navigation.goBack()}>
            <FontAwesome color="#ecfdf5" name="chevron-left" size={14} />
          </Pressable>
          <Text className="text-[22px] leading-7 text-white" style={styles.textBold}>
            Detail Invoice
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor="#059669" onRefresh={handleRefresh} />}
      >
        {error ? (
          <View className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <Text className="text-sm leading-5 text-rose-700" style={styles.textSemiBold}>
              {error}
            </Text>
          </View>
        ) : null}

        {invoice ? (
          <>
            <View className="rounded-3xl bg-primary-600 p-5">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-xs text-primary-50" style={styles.textRegular}>
                    {invoice.invoiceNo}
                  </Text>
                  <Text className="mt-2 text-[24px] leading-8 text-white" style={styles.textBold}>
                    {formatCurrency(invoice.total)}
                  </Text>
                  <Text className="mt-2 text-sm text-primary-50" style={styles.textRegular}>
                    {invoice.status === "PAID" ? "Tagihan sudah lunas" : "Tagihan belum dibayar"}
                  </Text>
                </View>
                <View className={invoice.status === "PAID" ? "rounded-full bg-emerald-100 px-3 py-1" : "rounded-full bg-amber-100 px-3 py-1"}>
                  <Text className={invoice.status === "PAID" ? "text-xs text-emerald-700" : "text-xs text-amber-700"} style={styles.textBold}>
                    {invoice.status === "PAID" ? "Lunas" : "Belum Lunas"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="rounded-3xl bg-white p-5">
              <InfoRow label="Pasien" value={invoice.visit.patient.name} />
              <InfoRow label="Dokter" value={`Dr. ${invoice.visit.doctor.name}`} />
              <InfoRow label="Nomor Kunjungan" value={invoice.visit.visitNumber} />
              <InfoRow label="Tanggal" value={formatDate(invoice.createdAt)} />
            </View>

            <View className="rounded-3xl bg-white p-5">
              <Text className="text-lg text-slate-950" style={styles.textBold}>
                Rincian Tagihan
              </Text>
              <View className="mt-2">
                {invoice.items.map((item) => (
                  <InvoiceItemRow item={item} key={item.id} />
                ))}
              </View>
              <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <Text className="text-sm text-slate-600" style={styles.textSemiBold}>
                  Total
                </Text>
                <Text className="text-base text-slate-950" style={styles.textBold}>
                  {formatCurrency(invoice.total)}
                </Text>
              </View>
            </View>

            {invoice.status === "UNPAID" ? (
              <Pressable
                className="rounded-2xl px-5 py-4 active:opacity-80"
                disabled={paying}
                onPress={handlePayInvoice}
                style={paying ? styles.disabledButton : styles.payButton}
              >
                <Text className="text-center text-base text-white" style={styles.textBold}>
                  {paying ? "Memproses..." : "Tandai Lunas"}
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-b border-slate-100 py-3">
      <Text className="text-xs text-slate-500" style={styles.textRegular}>
        {label}
      </Text>
      <Text className="mt-1 text-sm text-slate-950" style={styles.textSemiBold}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  disabledButton: {
    backgroundColor: "#34d399",
  },
  headerSafeArea: {
    backgroundColor: PRIMARY_600,
  },
  payButton: {
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
  textSemiBold: {
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: true,
  },
});
