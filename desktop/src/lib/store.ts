import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import type { LoginRequest, RegisterRequest } from "./types";

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      isAuthenticated: false,

      login: async (data) => {
        const res = await api.login(data);
        api.setToken(res.token);
        set({ token: res.token, username: res.username, isAuthenticated: true });
      },

      register: async (data) => {
        const res = await api.register(data);
        api.setToken(res.token);
        set({ token: res.token, username: res.username, isAuthenticated: true });
      },

      logout: () => {
        api.setToken(null);
        set({ token: null, username: null, isAuthenticated: false });
      },
    }),
    {
      name: "clarity-auth",
      onRehydrateStorage: () => (state) => {
        // Restore token into API client after page reload
        if (state?.token) api.setToken(state.token);
      },
    }
  )
);
