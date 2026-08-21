import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Platform } from "react-native";

const DEFAULT_API_URL = Platform.select({
  android: "http://10.0.2.2:5050/api",
  default: "http://localhost:5050/api",
});

const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: object;
  token?: string | null;
};

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;

    return axiosError.response?.data?.message || axiosError.message || "Terjadi kesalahan";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan";
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const config: AxiosRequestConfig = {
    method: options.method || "GET",
    url: path,
    data: options.body,
    headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
  };

  try {
    const response = await apiClient.request<T>(config);

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
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
