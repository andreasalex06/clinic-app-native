import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiGet } from "@/api/client";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { formatCurrency, formatDate } from "@/screens/invoices/types";
import { useAuthStore } from "@/stores/authStore";

import { FinanceData, FinancePeriod, FinanceResponse, FinanceTrend } from "./types";

const PRIMARY_600 = "#059669";
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

const PERIOD_OPTIONS: Array<{ value: FinancePeriod; label: string }> = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
];

const EMPTY_FINANCE: FinanceData = {
  summary: {
    totalRevenue: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    outstandingRevenue: 0,
  },
  trends: [],
  recentInvoices: [],
};

function getMaxTrendValue(trends: FinanceTrend[]) {
  return Math.max(...trends.map((trend) => Math.max(trend.revenue, trend.patients)), 1);
}

export function FinanceScreen() {
  const navigation = useNavigation<RootNavigation>();
  const token = useAuthStore((state) => state.token);
  const [period, setPeriod] = useState<FinancePeriod>("daily");
  const [finance, setFinance] = useState<FinanceData>(EMPTY_FINANCE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadFinance = useCallback(async () => {
    if (!token) return;

    setError("");
    const response = await apiGet<FinanceResponse>(`/finance?period=${period}`, token);

    setFinance(response.data);
  }, [period, token]);

  useEffect(() => {
    async function loadInitialFinance() {
      try {
        setLoading(true);
        await loadFinance();
      } catch (financeError) {
        setError(financeError instanceof Error ? financeError.message : "Gagal memuat finance");
      } finally {
        setLoading(false);
      }
    }

    void loadInitialFinance();
  }, [loadFinance]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadFinance();
    } catch (financeError) {
      setError(financeError instanceof Error ? financeError.message : "Gagal memuat finance");
    } finally {
      setRefreshing(false);
    }
  }

  function handleGoBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("MainTabs", { screen: "Dashboard" });
  }

  const maxTrendValue = getMaxTrendValue(finance.trends);
  const summaryCards = [
    {
      label: "Pendapatan",
      value: formatCurrency(finance.summary.totalRevenue),
      icon: "money",
    },
    {
      label: "Invoice Lunas",
      value: String(finance.summary.paidInvoices),
      icon: "check-circle-o",
    },
    {
      label: "Belum Bayar",
      value: String(finance.summary.unpaidInvoices),
      icon: "file-text-o",
    },
    {
      label: "Piutang",
      value: formatCurrency(finance.summary.outstandingRevenue),
      icon: "credit-card",
    },
  ] as const;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color="#059669" />
        <Text className="mt-4 text-sm text-slate-500" style={styles.textSemiBold}>
          Memuat finance...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View className="min-h-[76px] flex-row items-center justify-between gap-3 px-5 pb-4 pt-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/15 active:opacity-80" onPress={handleGoBack}>
              <FontAwesome color="#ecfdf5" name="chevron-left" size={16} />
            </Pressable>
            <View className="min-w-0 flex-1">
              <Text className="text-[22px] leading-7 text-white" style={styles.textBold}>
                Finance
              </Text>
              <Text className="mt-1 text-xs text-primary-50" numberOfLines={1} style={styles.textRegular}>
                Ringkasan pendapatan klinik
              </Text>
            </View>
          </View>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/15 active:opacity-80" onPress={handleRefresh}>
            <FontAwesome color="#ecfdf5" name="refresh" size={16} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor="#059669" onRefresh={handleRefresh} />}
      >
        <View className="rounded-2xl bg-primary-600 p-5" style={styles.banner}>
          <Text className="text-[20px] leading-7 text-white" style={styles.textBold}>
            Performa Keuangan
          </Text>
          <Text className="mt-2 text-sm leading-6 text-primary-50" style={styles.textRegular}>
            Data mengikuti endpoint finance dashboard terbaru.
          </Text>

          <View className="mt-5 flex-row flex-wrap gap-3">
            {summaryCards.map((card) => (
              <View key={card.label} className="min-h-[96px] flex-1 basis-[46%] rounded-2xl bg-white/10 p-4">
                <FontAwesome color="#d1fae5" name={card.icon} size={18} />
                <Text className="mt-3 text-[15px] leading-5 text-white" numberOfLines={2} adjustsFontSizeToFit style={styles.textBold}>
                  {card.value}
                </Text>
                <Text className="mt-1 text-xs text-primary-50" style={styles.textRegular}>
                  {card.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="rounded-3xl border border-primary-100 bg-white p-3">
          <View className="flex-row gap-2">
            {PERIOD_OPTIONS.map((option) => {
              const active = period === option.value;

              return (
                <Pressable
                  key={option.value}
                  className={active ? "min-h-10 flex-1 items-center justify-center rounded-2xl bg-primary-600 px-3" : "min-h-10 flex-1 items-center justify-center rounded-2xl bg-primary-50 px-3"}
                  onPress={() => setPeriod(option.value)}
                >
                  <Text className={active ? "text-xs text-white" : "text-xs text-primary-700"} style={styles.textBold}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? (
          <View className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <Text className="text-sm leading-5 text-rose-700" style={styles.textSemiBold}>
              {error}
            </Text>
          </View>
        ) : null}

        <View className="rounded-3xl border border-slate-100 bg-white p-4" style={styles.card}>
          <Text className="text-[18px] leading-6 text-slate-950" style={styles.textBold}>
            Tren Periode
          </Text>
          <View className="mt-4 gap-3">
            {finance.trends.map((trend) => {
              const revenueWidth = `${Math.max((trend.revenue / maxTrendValue) * 100, trend.revenue > 0 ? 8 : 0)}%` as `${number}%`;
              const patientWidth = `${Math.max((trend.patients / maxTrendValue) * 100, trend.patients > 0 ? 8 : 0)}%` as `${number}%`;

              return (
                <View key={trend.key}>
                  <View className="mb-2 flex-row items-center justify-between gap-3">
                    <Text className="flex-1 text-xs text-slate-500" numberOfLines={1} style={styles.textRegular}>
                      {trend.label}
                    </Text>
                    <Text className="text-xs text-slate-700" style={styles.textSemiBold}>
                      {formatCurrency(trend.revenue)}
                    </Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-primary-50">
                    <View className="h-2 rounded-full bg-primary-600" style={{ width: revenueWidth }} />
                  </View>
                  <View className="mt-1 h-2 overflow-hidden rounded-full bg-sky-50">
                    <View className="h-2 rounded-full bg-sky-500" style={{ width: patientWidth }} />
                  </View>
                  <Text className="mt-1 text-[11px] text-slate-400" style={styles.textRegular}>
                    {trend.patients} pasien
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="mb-3 text-[18px] leading-6 text-slate-950" style={styles.textBold}>
            Invoice Terbaru
          </Text>

          {finance.recentInvoices.length === 0 ? (
            <View className="rounded-3xl border border-dashed border-primary-200 bg-primary-50/60 p-6">
              <Text className="text-center text-sm leading-5 text-slate-500" style={styles.textSemiBold}>
                Belum ada data invoice.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {finance.recentInvoices.map((invoice) => (
                <View key={invoice.id} className="rounded-3xl border border-slate-100 bg-white p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="min-w-0 flex-1">
                      <Text className="text-xs text-primary-700" style={styles.textRegular}>
                        {invoice.invoiceNo}
                      </Text>
                      <Text className="mt-1 text-base text-slate-950" style={styles.textBold}>
                        {invoice.visit.patient.name}
                      </Text>
                      <Text className="mt-1 text-xs text-slate-500" style={styles.textRegular}>
                        {formatDate(invoice.createdAt)}
                      </Text>
                    </View>
                    <Text className="text-right text-sm text-slate-950" style={styles.textBold}>
                      {formatCurrency(invoice.total)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  banner: {
    elevation: 2,
    shadowColor: "#064e3b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  content: {
    gap: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
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
  textSemiBold: {
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: true,
  },
});
