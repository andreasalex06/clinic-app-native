import { Platform } from "react-native";

const DEFAULT_API_URL = Platform.select({
  android: "http://10.0.2.2:5050/api",
  default: "http://localhost:5050/api",
});

const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: object;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {};

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Terjadi kesalahan");
  }

  return data as T;
}

export function apiGet<T = unknown>(path: string, token?: string | null) {
  return request<T>(path, { token });
}

export function apiPost<T = unknown>(path: string, body: object, token?: string | null) {
  return request<T>(path, { method: "POST", body, token });
}

export function apiPatch<T = unknown>(path: string, body: object, token?: string | null) {
  return request<T>(path, { method: "PATCH", body, token });
}

export function apiDelete<T = unknown>(path: string, token?: string | null) {
  return request<T>(path, { method: "DELETE", token });
}
