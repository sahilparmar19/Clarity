import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import type { LoginRequest, RegisterRequest } from "./types";

interface AuthState {
  userId: number | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      username: null,
      isAuthenticated: false,

      login: async (data) => {
        const res = await api.login(data);
        set({ userId: res.userId, username: res.username, isAuthenticated: true });
      },

      register: async (data) => {
        const res = await api.register(data);
        set({ userId: res.userId, username: res.username, isAuthenticated: true });
      },

      logout: () => {
        set({ userId: null, username: null, isAuthenticated: false });
      },
    }),
    {
      name: "clarity-auth",
    }
  )
);
