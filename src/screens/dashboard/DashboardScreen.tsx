import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiGet } from "@/api/client";
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

function formatVisitTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
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
    { label: "Wait", value: summary.waiting, icon: "clock-o", tone: "amber" },
    { label: "Konsul", value: summary.inConsultation, icon: "stethoscope", tone: "sky" },
    { label: "Done", value: summary.completed, icon: "check-circle-o", tone: "emerald" },
    { label: "Unpaid", value: summary.unpaidInvoices, icon: "file-text-o", tone: "rose" },
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
      <View className="mb-5 bg-primary-600 px-5 pb-4" style={{ paddingTop: insets.top + 14 }}>
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-[22px] leading-7 text-white" style={styles.textBold}>
            Dashboard
          </Text>

          <View className="min-w-0 flex-row items-center gap-2 rounded-full bg-white/15 py-1.5 pl-2 pr-3">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <FontAwesome color="#ecfdf5" name="user" size={14} />
            </View>
            <View className="min-w-0">
              <Text className="max-w-28 text-[11px] leading-4 text-primary-50" numberOfLines={1} style={styles.textBold}>
                {user?.name ?? "Profile"}
              </Text>
              <Text className="text-[10px] leading-3 text-primary-100" style={styles.textRegular}>
                Profile
              </Text>
            </View>
          </View>
        </View>
      </View>

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

        <View className="mb-7 rounded-3xl bg-primary-600 p-4">
          <Text className="mb-3 text-[13px] leading-5 text-primary-50" style={styles.textRegular}>
            Ringkasan konsultasi hari ini.
          </Text>

          <View className="flex-row gap-1.5">
            {cards.map((card) => {
              const toneStyle = CARD_STYLES[card.tone];

              return (
                <View key={card.label} className="h-[110px] flex-1 items-center justify-center gap-0.5 rounded-2xl bg-slate-50 px-1 py-2">
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
              <View key={visit.id} className="rounded-3xl bg-primary-700 p-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-sm leading-5 text-white" style={styles.textBold}>
                      {visit.patient.name}
                    </Text>
                    <Text className="mt-1 text-xs leading-5 text-primary-100" style={styles.textRegular}>
                      {visit.visitNumber} - {visit.doctor.name}
                    </Text>
                  </View>
                  <View className={`rounded-full px-3 py-1 ${STATUS_STYLES[visit.status]}`}>
                    <Text className="text-[11px]" style={styles.textRegular}>
                      {STATUS_LABELS[visit.status]}
                    </Text>
                  </View>
                </View>
                <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-white/10 px-3 py-3">
                  <View className="flex-row items-center gap-2">
                    <FontAwesome color="#d1fae5" name="clock-o" size={14} />
                    <Text className="text-xs text-primary-50" style={styles.textSemiBold}>
                      {formatVisitTime(visit.checkInTime)}
                    </Text>
                  </View>
                  <Text className="text-xs text-primary-100" style={styles.textRegular}>
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
  content: {
    paddingBottom: 28,
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
