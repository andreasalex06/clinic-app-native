import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiGet } from "@/api/client";
import { formatQueueCode } from "@/lib/queue";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";

type DashboardSummary = {
  todayVisits: number;
  waiting: number;
  inConsultation: number;
  completed: number;
  unpaidInvoices: number;
};

type VisitStatus = "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED";

type TodayVisit = {
  id: string;
  visitNumber: string;
  queueNumber: number;
  queueDate: string;
  checkInTime: string;
  status: VisitStatus;
  patient: {
    name: string;
  };
  doctor: {
    name: string;
  };
};

type SummaryCard = {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  tone: "primary" | "amber" | "sky" | "emerald" | "rose";
};

const EMPTY_SUMMARY: DashboardSummary = {
  todayVisits: 0,
  waiting: 0,
  inConsultation: 0,
  completed: 0,
  unpaidInvoices: 0,
};

const STATUS_LABELS: Record<VisitStatus, string> = {
  WAITING: "Menunggu",
  IN_CONSULTATION: "Konsultasi",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const STATUS_STYLES: Record<VisitStatus, string> = {
  WAITING: "bg-amber-50 text-amber-700",
  IN_CONSULTATION: "bg-sky-50 text-sky-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

const CARD_STYLES: Record<SummaryCard["tone"], { icon: string }> = {
  primary: { icon: "#047857" },
  amber: { icon: "#b45309" },
  sky: { icon: "#0369a1" },
  emerald: { icon: "#047857" },
  rose: { icon: "#be123c" },
};

const PRIMARY_600 = "#059669";
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

function formatVisitTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardScreen() {
  const navigation = useNavigation<RootNavigation>();
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [visits, setVisits] = useState<TodayVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token) return;

    setError("");

    const [summaryResponse, visitsResponse] = await Promise.all([
      apiGet<{ data: DashboardSummary }>("/dashboard", token),
      apiGet<{ data: TodayVisit[] }>("/visits?date=today", token),
    ]);

    setSummary(summaryResponse.data);
    setVisits(visitsResponse.data);
  }, [token]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        await loadDashboard();
      } catch (dashboardError) {
        setError(dashboardError instanceof Error ? dashboardError.message : "Gagal memuat dashboard");
      } finally {
        setLoading(false);
      }
    }

    void loadInitialData();
  }, [loadDashboard]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadDashboard();
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : "Gagal memuat dashboard");
    } finally {
      setRefreshing(false);
    }
  }

  const cards: SummaryCard[] = [
    { label: "Visit", value: summary.todayVisits, icon: "users", tone: "primary" },
    { label: "Tunggu", value: summary.waiting, icon: "clock-o", tone: "amber" },
    { label: "Konsul", value: summary.inConsultation, icon: "stethoscope", tone: "sky" },
    { label: "Selesai", value: summary.completed, icon: "check-circle-o", tone: "emerald" },
    { label: "Belum", value: summary.unpaidInvoices, icon: "file-text-o", tone: "rose" },
  ];

  const displayedVisits = visits.slice(0, 5);
  const hiddenVisitsCount = Math.max(visits.length - displayedVisits.length, 0);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color="#059669" />
        <Text className="mt-4 text-sm text-slate-500" style={styles.textSemiBold}>
          Memuat dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor="#059669" onRefresh={handleRefresh} />}
    >
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View className="min-h-[76px] justify-center px-5 pb-4 pt-3">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-[22px] leading-7 text-white" style={styles.textBold}>
              Dashboard
            </Text>

            <View className="min-w-0 flex-row items-center gap-2">
              <View className="min-w-0 flex-row items-center gap-2 rounded-full bg-white/15 py-1.5 pl-2 pr-3">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <FontAwesome color="#ecfdf5" name="user" size={14} />
                </View>
                <View className="min-w-0">
                  <Text className="max-w-24 text-[11px] leading-4 text-primary-50" numberOfLines={1} style={styles.textBold}>
                    {user?.name ?? "Profile"}
                  </Text>
                  <Text className="text-[10px] leading-3 text-primary-100" style={styles.textRegular}>
                    Profile
                  </Text>
                </View>
              </View>

              <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/15 active:opacity-80" onPress={logout}>
                <FontAwesome color="#ecfdf5" name="sign-out" size={18} />
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <View className="px-5">
        {error ? (
          <View className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <Text className="text-sm leading-5 text-rose-700" style={styles.textSemiBold}>
              {error}
            </Text>
            <Pressable
              className="mt-3 min-h-10 items-center justify-center rounded-xl bg-rose-600 px-4 active:opacity-80"
              onPress={handleRefresh}
            >
              <Text className="text-sm text-white" style={styles.textBold}>
                Coba lagi
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View className="mb-7 rounded-2xl border border-slate-200 bg-white p-4" style={styles.card}>
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-base leading-6 text-slate-950" style={styles.textBold}>
                Ringkasan hari ini
              </Text>
              <Text className="mt-1 text-xs text-slate-500" style={styles.textRegular}>
                Aktivitas klinik secara langsung
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
              <FontAwesome color="#047857" name="bar-chart" size={15} />
            </View>
          </View>

          <View className="flex-row gap-1.5">
            {cards.map((card) => {
              const toneStyle = CARD_STYLES[card.tone];

              return (
                <View key={card.label} className="h-[104px] flex-1 items-center justify-center gap-0.5 rounded-xl border border-slate-100 bg-slate-50 px-1 py-2">
                  <View className="h-10 w-10 items-center justify-center">
                    <FontAwesome color={toneStyle.icon} name={card.icon} size={20} />
                  </View>
                  <Text className="text-center text-[18px] leading-[25px] text-slate-950" numberOfLines={1} style={styles.textRegular}>
                    {card.value}
                  </Text>
                  <Text className="text-center text-[11px] leading-[13px] text-slate-500" numberOfLines={1} adjustsFontSizeToFit style={styles.textRegular}>
                    {card.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="mb-7 flex-row gap-3">
          <Pressable className="flex-1 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 active:opacity-80" onPress={() => navigation.navigate("Finance")}>
            <View className="min-w-0 flex-1">
              <Text className="text-sm text-slate-950" style={styles.textBold}>Finance</Text>
              <Text className="mt-1 text-[11px] text-slate-500" style={styles.textRegular}>Lihat pendapatan</Text>
            </View>
            <FontAwesome color="#047857" name="line-chart" size={17} />
          </Pressable>
          <Pressable className="flex-1 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 active:opacity-80" onPress={() => navigation.navigate("Invoices")}>
            <View className="min-w-0 flex-1">
              <Text className="text-sm text-slate-950" style={styles.textBold}>Tagihan</Text>
              <Text className="mt-1 text-[11px] text-slate-500" style={styles.textRegular}>Kelola invoice</Text>
            </View>
            <FontAwesome color="#047857" name="file-text-o" size={17} />
          </Pressable>
        </View>

        <View className="mb-3 flex-row items-end justify-between gap-4">
          <View className="flex-1">
            <Text className="text-[18px] leading-6 text-slate-950" style={styles.textBold}>
              Antrean Hari Ini
            </Text>
            <Text className="mt-1 text-xs text-slate-500" style={styles.textRegular}>
              {hiddenVisitsCount > 0 ? `Menampilkan 5 dari ${visits.length} antrean.` : `${visits.length} antrean hari ini.`}
            </Text>
          </View>
          <Pressable className="rounded-full bg-primary-50 px-4 py-2 active:opacity-80" onPress={handleRefresh}>
            <Text className="text-xs text-primary-700" style={styles.textBold}>
              Refresh
            </Text>
          </Pressable>
        </View>

        {displayedVisits.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 p-6">
            <Text className="text-center text-sm leading-5 text-slate-500" style={styles.textSemiBold}>
              Belum ada kunjungan hari ini.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {displayedVisits.map((visit) => (
              <View key={visit.id} className="rounded-2xl border border-slate-200 bg-white p-4" style={styles.card}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-sm leading-5 text-slate-950" style={styles.textBold}>
                      {visit.patient.name}
                    </Text>
                    <Text className="mt-1 text-xs leading-5 text-slate-500" style={styles.textRegular}>
                      {formatQueueCode(visit.queueNumber)} - {visit.visitNumber} - {visit.doctor.name}
                    </Text>
                  </View>
                  <View className={`rounded-full px-3 py-1 ${STATUS_STYLES[visit.status]}`}>
                    <Text className="text-[11px]" style={styles.textRegular}>
                      {STATUS_LABELS[visit.status]}
                    </Text>
                  </View>
                </View>
                <View className="mt-4 flex-row items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                  <View className="flex-row items-center gap-2">
                    <FontAwesome color="#64748b" name="clock-o" size={14} />
                    <Text className="text-xs text-slate-600" style={styles.textSemiBold}>
                      {formatVisitTime(visit.checkInTime)}
                    </Text>
                  </View>
                  <Text className="text-xs text-slate-400" style={styles.textRegular}>
                    Hari ini
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  content: {
    paddingBottom: 28,
  },
  headerSafeArea: {
    backgroundColor: PRIMARY_600,
    marginBottom: 20,
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
