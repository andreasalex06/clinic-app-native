import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { apiGet } from "@/api/client";

export default function HomeScreen() {
  const [message, setMessage] = useState("Belum cek koneksi backend");
  const [loading, setLoading] = useState(false);

  async function handleCheckBackend() {
    try {
      setLoading(true);
      setMessage("Mengecek koneksi...");

      const result = await apiGet("/test");

      setMessage(result.message);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Gagal terhubung ke backend");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <Text className="mb-2 text-3xl font-bold text-slate-950">
        ClinicApp Mobile
      </Text>

      <Text className="mb-6 text-base leading-6 text-slate-600">
        Frontend React Native terhubung ke backend Express.
      </Text>

      <View className="rounded-2xl border border-slate-200 bg-white p-5">
        <Text className="mb-2 text-xs font-semibold uppercase text-slate-500">
          Status Backend
        </Text>

        <Text className="mb-5 text-lg font-semibold text-slate-950">
          {message}
        </Text>

        <Pressable
          className="min-h-12 items-center justify-center rounded-xl bg-primary-600 px-4 active:opacity-80"
          onPress={handleCheckBackend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-bold text-white">Cek Backend</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
