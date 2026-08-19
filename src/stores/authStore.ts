import { create } from "zustand";

import { apiGet, apiPost } from "@/api/client";
import {
  deleteStoredToken,
  deleteStoredUser,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "@/auth/storage";

type Role = "ADMIN" | "STAFF" | "DOCTOR";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type LoginResponse = {
  data: {
    token: string;
    user: AuthUser;
  };
};

type MeResponse = {
  data: AuthUser;
};

type AuthState = {
  initialized: boolean;
  token: string | null;
  user: AuthUser | null;
  hydrateAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  initialized: false,
  token: null,
  user: null,

  async hydrateAuth() {
    try {
      const [storedToken, storedUser] = await Promise.all([getStoredToken(), getStoredUser()]);

      set({
        token: storedToken,
        user: storedUser ? JSON.parse(storedUser) : null,
      });
    } finally {
      set({ initialized: true });
    }
  },

  async login(email, password) {
    const response = await apiPost<LoginResponse>("/auth/login", { email, password });

    await Promise.all([
      setStoredToken(response.data.token),
      setStoredUser(JSON.stringify(response.data.user)),
    ]);

    set({
      token: response.data.token,
      user: response.data.user,
    });
  },

  async logout() {
    await Promise.all([deleteStoredToken(), deleteStoredUser()]);

    set({
      token: null,
      user: null,
    });
  },

  async refreshUser() {
    const token = get().token;

    if (!token) return;

    const response = await apiGet<MeResponse>("/auth/me", token);

    await setStoredUser(JSON.stringify(response.data));
    set({ user: response.data });
  },
}));
