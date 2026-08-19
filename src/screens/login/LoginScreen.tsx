import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuthStore } from "@/stores/authStore";

export function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("admin@clinic.test");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      setError("");
      await login(email.trim(), password);
    } catch (loginError) {
      if (loginError instanceof Error) {
        setError(loginError.message);
      } else {
        setError("Login gagal");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require("@/assets/images/aset-bg.jpg")}
      resizeMode="cover"
      imageStyle={styles.backgroundImage}
      style={styles.background}
    >
      <View className="flex-1 bg-slate-950/45">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
        >
          <View className="flex-1 items-start justify-center px-6 pb-9 pt-12">
            <Text className="text-left text-[27px] leading-[35px] text-primary-100" style={styles.textBold}>
              Selamat datang di Clinic App Management
            </Text>
            <Text className="mt-2 text-left text-[13px] leading-5 text-slate-100" style={styles.textRegular}>
              Gunakan akun klinik yang sudah terdaftar.
            </Text>
          </View>

          <View className="w-full rounded-t-[34px] border border-b-0 border-white/80 bg-white/95 px-6 pb-14 pt-8 shadow-lg">
            <View className="mb-6">
              <Text className="text-[26px] leading-8 text-primary-700" style={styles.textBold}>
                Login
              </Text>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-[13px] text-slate-700" style={styles.textSemiBold}>
                Email
              </Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                className="min-h-12 rounded-2xl border border-slate-100 bg-slate-50 text-[14px] text-slate-950"
                style={[styles.input, styles.textRegular]}
                placeholder="admin@clinic.test"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-[13px] text-slate-700" style={styles.textSemiBold}>
                Password
              </Text>
              <View className="min-h-12 flex-row items-center rounded-2xl border border-slate-100 bg-slate-50">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  secureTextEntry={!passwordVisible}
                  className="min-h-12 flex-1 text-[14px] text-slate-950"
                  style={[styles.passwordInput, styles.textRegular]}
                  placeholder="password123"
                  placeholderTextColor="#94a3b8"
                />
                <Pressable
                  className="min-h-12 items-center justify-center px-4 active:opacity-70"
                  disabled={loading}
                  onPressIn={() => setPasswordVisible(true)}
                  onPressOut={() => setPasswordVisible(false)}
                >
                  <SymbolView
                    name={{
                      ios: passwordVisible ? "eye.slash" : "eye",
                      android: passwordVisible ? "visibility_off" : "visibility",
                      web: passwordVisible ? "visibility_off" : "visibility",
                    }}
                    size={20}
                    tintColor="#047857"
                  />
                </Pressable>
              </View>
            </View>

            <Text className="mb-5 text-right text-xs text-primary-700" style={styles.textSemiBold}>
              Forgot password?
            </Text>

            {error ? (
              <Text className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs leading-5 text-red-700" style={styles.textSemiBold}>
                {error}
              </Text>
            ) : null}

            <Pressable
              className="min-h-12 items-center justify-center rounded-full bg-primary-600 px-4 active:opacity-80 disabled:opacity-60"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-[15px] text-white" style={styles.textBold}>
                  Login
                </Text>
              )}
            </Pressable>

            <View className="my-6 flex-row items-center">
              <View className="h-px flex-1 bg-slate-200" />
              <Text className="px-3 text-[11px] text-slate-400" style={styles.textSemiBold}>
                or sign with
              </Text>
              <View className="h-px flex-1 bg-slate-200" />
            </View>

            <View className="mb-6 flex-row justify-center gap-4">
              <Pressable className="h-12 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
                <FontAwesome color="#2563eb" name="google" size={21} />
              </Pressable>
              <Pressable className="h-12 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
                <FontAwesome color="#020617" name="apple" size={23} />
              </Pressable>
              <Pressable className="h-12 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
                <FontAwesome color="#db2777" name="instagram" size={22} />
              </Pressable>
            </View>

            <Text className="text-center text-xs leading-5 text-slate-500" style={styles.textRegular}>
              Belum punya akun? <Text className="text-primary-700" style={styles.textBold}>Registrasi</Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    minHeight: "100%",
  },
  backgroundImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  input: {
    paddingHorizontal: 18,
  },
  passwordInput: {
    paddingLeft: 18,
    paddingRight: 8,
  },
  textBold: {
    fontFamily: "Poppins_700Bold",
  },
  textRegular: {
    fontFamily: "Poppins_400Regular",
  },
  textSemiBold: {
    fontFamily: "Poppins_600SemiBold",
  },
});
