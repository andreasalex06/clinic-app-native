import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiGet, apiPatch } from "@/api/client";
import { formatQueueCode } from "@/lib/queue";
import { useAuthStore } from "@/stores/authStore";

import { PHARMACY_STATUS_LABEL, PharmacyListResponse, PharmacyOrder, PharmacyStatus } from "./types";

const PRIMARY_600 = "#059669";
const PAGE_LIMIT = 5;

const STATUS_OPTIONS: Array<{ value: PharmacyStatus | ""; label: string }> = [
  { value: "", label: "Semua" },
  { value: "WAITING_PAYMENT", label: "Menunggu Bayar" },
  { value: "PREPARING", label: "Diracik" },
  { value: "READY_FOR_PICKUP", label: "Siap Diambil" },
  { value: "COMPLETED", label: "Selesai" },
];

const STATUS_STYLE: Record<PharmacyStatus, { backgroundColor: string; color: string }> = {
  WAITING_PAYMENT: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },
  PREPARING: {
    backgroundColor: "#ccfbf1",
    color: "#0f766e",
  },
  READY_FOR_PICKUP: {
    backgroundColor: "#d1fae5",
    color: "#047857",
  },
  COMPLETED: {
    backgroundColor: "#e2e8f0",
    color: "#475569",
  },
};

function getMedicineSummary(order: PharmacyOrder) {
  const medicines = order.visit.consultation?.medicines ?? [];

  if (medicines.length === 0) {
    return "Tidak ada obat";
  }

  return medicines.map((item) => `${item.medicine.name} x${item.quantity}`).join(", ");
}

export function PharmacyScreen() {
  const token = useAuthStore((state) => state.token);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [status, setStatus] = useState<PharmacyStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const loadingMoreRef = useRef(false);

  const loadOrders = useCallback(async (nextPage = 1, mode: "replace" | "append" = "replace") => {
    if (!token) return;

    setError("");
    const queryParams = [`page=${nextPage}`, `limit=${PAGE_LIMIT}`];
    if (status) queryParams.push(`status=${status}`);
    const query = `?${queryParams.join("&")}`;
    const response = await apiGet<PharmacyListResponse>(`/pharmacy${query}`, token);

    setOrders((currentOrders) => mode === "replace" ? response.data : [...currentOrders, ...response.data]);
    setPage(response.meta.page);
    setTotalOrders(response.meta.total);
    setHasNextPage(response.meta.page < response.meta.totalPages);
  }, [status, token]);

  useEffect(() => {
    async function loadInitialOrders() {
      try {
        setLoading(true);
        await loadOrders();
      } catch (pharmacyError) {
        setError(pharmacyError instanceof Error ? pharmacyError.message : "Gagal memuat farmasi");
      } finally {
        setLoading(false);
      }
    }

    void loadInitialOrders();
  }, [loadOrders]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadOrders(1, "replace");
    } catch (pharmacyError) {
      setError(pharmacyError instanceof Error ? pharmacyError.message : "Gagal memuat farmasi");
    } finally {
      setRefreshing(false);
    }
  }

  async function updateOrder(order: PharmacyOrder, action: "ready" | "complete") {
    try {
      setUpdatingId(order.id);
      setError("");
      await apiPatch(`/pharmacy/${order.id}/${action}`, {}, token);
      await loadOrders(1, "replace");
    } catch (pharmacyError) {
      setError(pharmacyError instanceof Error ? pharmacyError.message : "Status farmasi gagal diperbarui");
    } finally {
      setUpdatingId("");
    }
  }

  async function handleLoadMore() {
    if (loading || loadingMore || loadingMoreRef.current || refreshing || !hasNextPage) return;

    try {
      loadingMoreRef.current = true;
      setLoadingMore(true);
      await loadOrders(page + 1, "append");
    } catch (pharmacyError) {
      setError(pharmacyError instanceof Error ? pharmacyError.message : "Gagal memuat order berikutnya");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  function renderAction(order: PharmacyOrder) {
    if (order.status === "PREPARING") {
      return (
        <Pressable
          className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 active:opacity-80 disabled:opacity-60"
          disabled={updatingId === order.id}
          onPress={() => updateOrder(order, "ready")}
        >
          <FontAwesome color="#ecfdf5" name="check" size={13} />
          <Text className="text-sm text-white" style={styles.textBold}>
            Siap Diambil
          </Text>
        </Pressable>
      );
    }

    if (order.status === "READY_FOR_PICKUP") {
      return (
        <Pressable
          className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 active:opacity-80 disabled:opacity-60"
          disabled={updatingId === order.id}
          onPress={() => updateOrder(order, "complete")}
        >
          <FontAwesome color="#ecfdf5" name="check-circle-o" size={14} />
          <Text className="text-sm text-white" style={styles.textBold}>
            Selesai
          </Text>
        </Pressable>
      );
    }

    return (
      <Text className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500" style={styles.textSemiBold}>
        {order.status === "WAITING_PAYMENT" ? "Menunggu pembayaran kasir" : "-"}
      </Text>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color="#059669" />
        <Text className="mt-4 text-sm text-slate-500" style={styles.textSemiBold}>
          Memuat farmasi...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View className="min-h-[76px] flex-row items-center justify-between gap-3 px-5 pb-4 pt-3">
          <View>
            <Text className="text-[22px] leading-7 text-white" style={styles.textBold}>
              Farmasi
            </Text>
            <Text className="mt-1 text-xs text-primary-50" style={styles.textRegular}>
              Kelola order obat pasien
            </Text>
          </View>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/15 active:opacity-80" onPress={handleRefresh}>
            <FontAwesome color="#ecfdf5" name="refresh" size={16} />
          </Pressable>
        </View>
      </SafeAreaView>

      <FlatList
        className="flex-1"
        contentContainerStyle={styles.content}
        data={orders}
        keyExtractor={(order) => order.id}
        ListEmptyComponent={
          <View className="rounded-3xl border border-dashed border-primary-200 bg-primary-50/60 p-6">
            <Text className="text-center text-sm leading-5 text-slate-500" style={styles.textSemiBold}>Belum ada order farmasi.</Text>
          </View>
        }
        ListFooterComponent={loadingMore ? <View className="items-center py-4"><ActivityIndicator color="#059669" /><Text className="mt-2 text-xs text-slate-500" style={styles.textRegular}>Memuat order berikutnya...</Text></View> : <View className="h-2" />}
        ListHeaderComponent={
          <>
            <View className="rounded-2xl bg-primary-600 p-5" style={styles.banner}>
              <View className="flex-row items-start justify-between gap-4">
                <View className="min-w-0 flex-1">
                  <Text className="text-[20px] leading-7 text-white" style={styles.textBold}>
                    Order Obat
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-primary-50" style={styles.textRegular}>
                    Pantau obat yang menunggu bayar, diracik, dan siap diambil.
                  </Text>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <FontAwesome color="#ecfdf5" name="medkit" size={21} />
                </View>
              </View>

              <View className="mt-5 flex-row gap-3">
                <View className="flex-1 rounded-2xl bg-white/10 px-4 py-3">
                  <Text className="text-xs text-primary-50" style={styles.textRegular}>
                    Total order
                  </Text>
                  <Text className="mt-1 text-base text-white" style={styles.textBold}>
                    {totalOrders}
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-white/10 px-4 py-3">
                  <Text className="text-xs text-primary-50" style={styles.textRegular}>
                    Filter
                  </Text>
                  <Text className="mt-1 text-base text-white" numberOfLines={1} adjustsFontSizeToFit style={styles.textBold}>
                    {status ? PHARMACY_STATUS_LABEL[status] : "Semua"}
                  </Text>
                </View>
              </View>
            </View>

            {error ? (
              <View className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                <Text className="text-sm leading-5 text-rose-700" style={styles.textSemiBold}>
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="rounded-2xl border border-slate-200 bg-white p-3" style={styles.card}>
              <View className="mb-3 flex-row items-center justify-between gap-4 px-1">
                <View className="min-w-0 flex-1">
                  <Text className="text-[18px] leading-6 text-slate-950" style={styles.textBold}>
                    Daftar Order
                  </Text>
                  <Text className="mt-1 text-xs text-slate-500" style={styles.textRegular}>
                    {totalOrders} order farmasi
                  </Text>
                </View>
                <Pressable className="rounded-full bg-primary-50 px-4 py-2 active:opacity-80" onPress={handleRefresh}>
                  <Text className="text-xs text-primary-700" style={styles.textBold}>
                    Refresh
                  </Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 px-0.5">
                  {STATUS_OPTIONS.map((option) => {
                    const active = status === option.value;

                    return (
                      <Pressable
                        key={option.label}
                        className={active ? "rounded-xl bg-primary-600 px-4 py-2.5" : "rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5"}
                        onPress={() => setStatus(option.value)}
                      >
                        <Text className={active ? "text-xs text-white" : "text-xs text-slate-600"} style={styles.textBold}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor="#059669" onRefresh={handleRefresh} />}
        renderItem={({ item: order }) => {
          const statusStyle = STATUS_STYLE[order.status];

          return (
            <View className="rounded-2xl border border-slate-200 bg-white p-4" style={styles.card}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <Text className="text-xs text-primary-700" style={styles.textSemiBold}>
                    {formatQueueCode(order.queueNumber)}
                  </Text>
                  <Text className="mt-1 text-base leading-6 text-slate-950" style={styles.textBold}>
                    {order.visit.patient.name}
                  </Text>
                  <Text className="mt-1 text-xs leading-5 text-slate-500" style={styles.textRegular}>
                    {order.visit.visitNumber}
                  </Text>
                </View>

                <View className="rounded-full px-3 py-1" style={{ backgroundColor: statusStyle.backgroundColor }}>
                  <Text className="text-[11px]" style={[styles.textBold, { color: statusStyle.color }]}>
                    {PHARMACY_STATUS_LABEL[order.status]}
                  </Text>
                </View>
              </View>

              <View className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                <View className="mb-2 flex-row items-center gap-2">
                  <FontAwesome color="#64748b" name="user-md" size={13} />
                  <Text className="text-xs text-slate-600" style={styles.textSemiBold}>
                    Dr. {order.visit.doctor.name}
                  </Text>
                </View>
                <Text className="text-sm leading-6 text-slate-600" style={styles.textRegular}>
                  {getMedicineSummary(order)}
                </Text>
              </View>

              {renderAction(order)}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    elevation: 2,
    shadowColor: "#064e3b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  card: {
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
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
