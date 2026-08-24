import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiGet } from "@/api/client";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";

import { InvoiceCard } from "./components/InvoiceCard";
import { formatCurrency, InvoiceListItem, InvoiceListResponse, InvoiceListSummary } from "./types";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

const PRIMARY_600 = "#059669";
const PAGE_LIMIT = 10;

function appendUniqueInvoices(currentInvoices: InvoiceListItem[], nextInvoices: InvoiceListItem[]) {
  const invoiceIds = new Set(currentInvoices.map((invoice) => invoice.id));
  const uniqueNextInvoices = nextInvoices.filter((invoice) => !invoiceIds.has(invoice.id));

  return [...currentInvoices, ...uniqueNextInvoices];
}

function buildInvoiceQuery(searchTerm: string, page: number) {
  const queryParams = [`page=${page}`, `limit=${PAGE_LIMIT}`];

  if (searchTerm.trim()) {
    queryParams.push(`search=${encodeURIComponent(searchTerm.trim())}`);
  }

  return queryParams.join("&");
}

export function InvoicesScreen() {
  const navigation = useNavigation<RootNavigation>();
  const hasLoadedInvoices = useRef(false);
  const loadingMoreRef = useRef(false);
  const token = useAuthStore((state) => state.token);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [globalSummary, setGlobalSummary] = useState<InvoiceListSummary>({
    totalInvoices: 0,
    totalUnpaid: 0,
  });
  const [hasNextPage, setHasNextPage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadInvoicesPage = useCallback(async (searchTerm: string, nextPage = 1, mode: "replace" | "append" = "replace") => {
    if (!token) return;

    setError("");

    const query = buildInvoiceQuery(searchTerm, nextPage);
    const response = await apiGet<InvoiceListResponse>(`/invoices?${query}`, token);

    setInvoices((currentInvoices) => {
      if (mode === "replace") return response.data;

      return appendUniqueInvoices(currentInvoices, response.data);
    });
    setPage(response.meta.page);
    setTotalInvoices(response.meta.total);
    if (!searchTerm.trim()) {
      setGlobalSummary(response.summary);
    }
    setHasNextPage(response.meta.page < response.meta.totalPages);
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 1000);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setInitialLoading(true);
        await loadInvoicesPage("", 1, "replace");
        hasLoadedInvoices.current = true;
      } catch (invoiceError) {
        setError(invoiceError instanceof Error ? invoiceError.message : "Gagal memuat invoice");
      } finally {
        setInitialLoading(false);
      }
    }

    void loadInitialData();
  }, [loadInvoicesPage]);

  useEffect(() => {
    if (!hasLoadedInvoices.current) return;

    async function searchInvoices() {
      try {
        setSearching(true);
        await loadInvoicesPage(debouncedSearch, 1, "replace");
      } catch (invoiceError) {
        setError(invoiceError instanceof Error ? invoiceError.message : "Gagal mencari invoice");
      } finally {
        setSearching(false);
      }
    }

    void searchInvoices();
  }, [debouncedSearch, loadInvoicesPage]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadInvoicesPage(debouncedSearch, 1, "replace");
    } catch (invoiceError) {
      setError(invoiceError instanceof Error ? invoiceError.message : "Gagal memuat invoice");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLoadMore() {
    if (initialLoading || searching || loadingMore || loadingMoreRef.current || refreshing || !hasNextPage) return;

    try {
      loadingMoreRef.current = true;
      setLoadingMore(true);
      await loadInvoicesPage(debouncedSearch, page + 1, "append");
    } catch (invoiceError) {
      setError(invoiceError instanceof Error ? invoiceError.message : "Gagal memuat invoice");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  function openInvoiceDetail(invoice: InvoiceListItem) {
    navigation.navigate("InvoiceDetail", {
      visitId: invoice.visit.id,
    });
  }

  if (initialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator color="#059669" />
        <Text className="mt-4 text-sm text-slate-500" style={styles.textSemiBold}>
          Memuat invoice...
        </Text>
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View className="rounded-3xl border border-dashed border-primary-200 bg-primary-50/60 p-6">
        <Text className="text-center text-sm leading-5 text-slate-500" style={styles.textSemiBold}>
          Belum ada invoice. Invoice akan muncul setelah konsultasi diselesaikan.
        </Text>
      </View>
    );
  }

  function renderFooter() {
    if (!loadingMore) return <View className="h-2" />;

    return (
      <View className="items-center py-4">
        <ActivityIndicator color="#059669" />
        <Text className="mt-2 text-xs text-slate-500" style={styles.textRegular}>
          Memuat invoice berikutnya...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View className="min-h-[76px] justify-center px-5 pb-4 pt-3">
          <Text className="text-[22px] leading-7 text-white" style={styles.textBold}>
            Invoices
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.topContent}>
        <View className="mb-1 rounded-3xl bg-primary-600 p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[20px] leading-7 text-white" style={styles.textBold}>
                Ringkasan Tagihan
              </Text>
              <Text className="mt-2 text-sm leading-6 text-primary-50" style={styles.textRegular}>
                Pantau status pembayaran invoice dari konsultasi yang selesai.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <FontAwesome color="#ecfdf5" name="file-text-o" size={22} />
            </View>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-white/10 px-4 py-3">
              <Text className="text-xs text-primary-50" style={styles.textRegular}>
                Total invoice
              </Text>
              <Text className="mt-1 text-base text-white" style={styles.textBold}>
                {globalSummary.totalInvoices}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-white/10 px-4 py-3">
              <Text className="text-xs text-primary-50" style={styles.textRegular}>
                Belum lunas
              </Text>
              <Text className="mt-1 text-base text-white" style={styles.textBold}>
                {formatCurrency(globalSummary.totalUnpaid)}
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

        <View>
          <View className="mb-3 flex-row items-center justify-between gap-4">
            <View className="min-w-0 flex-1">
              <Text className="text-[18px] leading-6 text-slate-950" style={styles.textBold}>
                Daftar Invoice
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-2">
                {searching ? <ActivityIndicator color="#059669" size="small" /> : null}
                <Text className="text-xs text-slate-500" style={styles.textRegular}>
                  {searching ? "Mencari invoice..." : `${totalInvoices} invoice`}
                </Text>
              </View>
              <Pressable className="rounded-full bg-primary-50 px-4 py-2 active:opacity-80" onPress={handleRefresh}>
                <Text className="text-xs text-primary-700" style={styles.textBold}>
                  Refresh
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
            <FontAwesome color="#64748b" name="search" size={15} />
            <TextInput
              className="min-h-12 flex-1 text-sm text-slate-950"
              onChangeText={setSearch}
              placeholder="Cari invoice, pasien, dokter"
              placeholderTextColor="#94a3b8"
              returnKeyType="search"
              style={styles.textRegular}
              value={search}
            />
          </View>
        </View>
      </View>

      <FlatList
        className="flex-1"
        contentContainerStyle={styles.listContent}
        data={invoices}
        keyExtractor={(invoice) => invoice.id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor="#059669" onRefresh={handleRefresh} />}
        renderItem={({ item }) => <InvoiceCard invoice={item} onPress={openInvoiceDetail} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  topContent: {
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
