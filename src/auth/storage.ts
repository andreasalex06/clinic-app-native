import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "clinic_token";
const USER_KEY = "clinic_user";

function readWebItem(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeWebItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

function deleteWebItem(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export async function getStoredToken() {
  if (Platform.OS === "web") return readWebItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string) {
  if (Platform.OS === "web") {
    writeWebItem(TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function deleteStoredToken() {
  if (Platform.OS === "web") {
    deleteWebItem(TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getStoredUser() {
  if (Platform.OS === "web") return readWebItem(USER_KEY);
  return SecureStore.getItemAsync(USER_KEY);
}

export async function setStoredUser(user: string) {
  if (Platform.OS === "web") {
    writeWebItem(USER_KEY, user);
    return;
  }

  await SecureStore.setItemAsync(USER_KEY, user);
}

export async function deleteStoredUser() {
  if (Platform.OS === "web") {
    deleteWebItem(USER_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(USER_KEY);
}
